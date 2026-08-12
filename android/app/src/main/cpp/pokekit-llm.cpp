#include <jni.h>
#include <android/log.h>

#include <atomic>
#include <cstdint>
#include <mutex>
#include <string>
#include <thread>
#include <unordered_set>

#include <llama.h>

#include "chat.h"
#include "common.h"

#ifndef LLAMA_CPP_TAG
#define LLAMA_CPP_TAG "unknown"
#endif

#define LOG_TAG "pokekit-llm"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// Real llama.cpp session state. One instance per successful nativeLoadModel.
// The generation bead (Phase 6b) runs decode on a worker thread while holding
// generateMutex; nativeUnloadModel/nativeFreeModel take the same mutex so a
// Stop-then-unload waits for an in-flight generation to observe cancellation
// and exit instead of freeing the model underneath it (use-after-free).
struct LlmSession {
    llama_model * model = nullptr;
    llama_context * ctx = nullptr;
    llama_sampler * sampler = nullptr;
    common_chat_templates_ptr tmpls;
    std::mutex generateMutex;
    std::atomic<bool> cancelled{false};

    // Sampler defaults stored on the session so the generation bead can
    // rebuild a PER-REQUEST chain (optionally with a grammar sampler for
    // tool-calling formats) without re-parsing request knobs.
    float temp = 0.7f;
    float min_p = 0.05f;
    uint32_t seed = LLAMA_DEFAULT_SEED;
};

// Registry of live sessions. nativeUnloadModel/nativeFreeModel may be called
// with the same handle from several threads (e.g. Stop racing the load
// thread's failure path); the registry makes both idempotent and prevents a
// double-free, even with a stale non-zero handle.
static std::mutex g_registry_mutex;
static std::unordered_set<LlmSession *> g_live_sessions;

static void register_session(LlmSession * session) {
    std::lock_guard<std::mutex> lock(g_registry_mutex);
    g_live_sessions.insert(session);
}

// Frees a session's resources (mirror order of simple-chat.cpp:
// llama_sampler_free -> llama_free -> llama_model_free). If delete_struct is
// set, also removes the session from the registry and deletes the struct.
// Idempotent: unknown handles are no-ops. Always locks generateMutex so
// unloading waits for an in-flight generation to exit first.
static void teardown_session(jlong handle, bool delete_struct) {
    if (handle == 0) {
        return;
    }
    auto * session = reinterpret_cast<LlmSession *>(handle);
    std::lock_guard<std::mutex> reg_lock(g_registry_mutex);
    if (g_live_sessions.count(session) == 0) {
        return; // already torn down
    }
    std::lock_guard<std::mutex> gen_lock(session->generateMutex);
    if (session->sampler != nullptr) {
        llama_sampler_free(session->sampler);
        session->sampler = nullptr;
    }
    session->tmpls.reset();
    if (session->ctx != nullptr) {
        llama_free(session->ctx);
        session->ctx = nullptr;
    }
    if (session->model != nullptr) {
        llama_model_free(session->model);
        session->model = nullptr;
    }
    if (delete_struct) {
        g_live_sessions.erase(session);
        delete session;
    }
}

// Builds a sampler chain from the session's stored defaults plus an optional
// grammar string (common_chat_templates_apply can return a grammar for
// tool-calling formats; the generation bead rebuilds the chain per request).
static llama_sampler * build_sampler_chain(const LlmSession * session, const std::string & grammar) {
    llama_sampler * chain = llama_sampler_chain_init(llama_sampler_chain_default_params());
    if (chain == nullptr) {
        return nullptr;
    }
    llama_sampler_chain_add(chain, llama_sampler_init_min_p(session->min_p, 1));
    llama_sampler_chain_add(chain, llama_sampler_init_temp(session->temp));
    if (!grammar.empty()) {
        llama_sampler * grammar_sampler = llama_sampler_init_grammar(
            llama_model_get_vocab(session->model), grammar.c_str(), "root");
        if (grammar_sampler == nullptr) {
            llama_sampler_free(chain);
            return nullptr;
        }
        llama_sampler_chain_add(chain, grammar_sampler);
    }
    llama_sampler_chain_add(chain, llama_sampler_init_dist(session->seed));
    return chain;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmPlugin_nativePing(JNIEnv *env, jobject /* thiz */) {
    std::string info = "pokekit-llm JNI shim OK | llama.cpp tag: ";
    info += LLAMA_CPP_TAG;
    info += " | backends: ";
    info += llama_print_system_info();
    return env->NewStringUTF(info.c_str());
}

// Loads a GGUF model and returns an opaque session handle (pointer cast), or 0
// on ANY failure with everything already freed. Kotlin treats 0 as fatal.
extern "C" JNIEXPORT jlong JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmService_nativeLoadModel(JNIEnv * env, jobject /* thiz */, jstring jPath) {
    if (jPath == nullptr) {
        LOGE("nativeLoadModel: null path");
        return 0;
    }
    LlmSession * session = nullptr;
    try {
        const char * cPath = env->GetStringUTFChars(jPath, nullptr);
        if (cPath == nullptr) {
            LOGE("nativeLoadModel: GetStringUTFChars failed");
            return 0;
        }
        std::string path = cPath;
        env->ReleaseStringUTFChars(jPath, cPath);

        // CPU-only build; the CPU backend is statically linked and registered.
        // Idempotent, safe to call on every load (e.g. service restarts).
        llama_backend_init();

        session = new (std::nothrow) LlmSession();
        if (session == nullptr) {
            LOGE("nativeLoadModel: out of memory");
            return 0;
        }
        register_session(session);
        const jlong handle = reinterpret_cast<jlong>(session);

        llama_model_params model_params = llama_model_default_params();
        model_params.n_gpu_layers = 0; // CPU-only, decided
        session->model = llama_model_load_from_file(path.c_str(), model_params);
        if (session->model == nullptr) {
            LOGE("nativeLoadModel: failed to load model from %s", path.c_str());
            teardown_session(handle, true);
            return 0;
        }

        llama_context_params ctx_params = llama_context_default_params();
        int32_t n_ctx_train = llama_model_n_ctx_train(session->model);
        if (n_ctx_train <= 0) {
            n_ctx_train = 8192;
        }
        ctx_params.n_ctx = n_ctx_train > 8192 ? 8192 : static_cast<uint32_t>(n_ctx_train);
        const unsigned int hw_concurrency = std::thread::hardware_concurrency();
        // Leave 1-2 cores free for the UI/HTTP threads, min 1.
        ctx_params.n_threads = hw_concurrency > 2 ? static_cast<int32_t>(hw_concurrency - 2) : 1;
        ctx_params.n_threads_batch = ctx_params.n_threads;
        LOGI("nativeLoadModel: n_ctx=%u n_threads=%d", ctx_params.n_ctx, ctx_params.n_threads);
        session->ctx = llama_init_from_model(session->model, ctx_params);
        if (session->ctx == nullptr) {
            LOGE("nativeLoadModel: failed to init llama_context");
            teardown_session(handle, true);
            return 0;
        }

        session->sampler = build_sampler_chain(session, "");
        if (session->sampler == nullptr) {
            LOGE("nativeLoadModel: failed to build sampler chain");
            teardown_session(handle, true);
            return 0;
        }

        // Empty override = the model's own embedded template first.
        session->tmpls = common_chat_templates_init(session->model, "");
        if (!session->tmpls) {
            LOGE("nativeLoadModel: failed to init chat templates");
            teardown_session(handle, true);
            return 0;
        }

        LOGI("nativeLoadModel: session ready, handle=%lld", static_cast<long long>(handle));
        return handle;
    } catch (const std::exception & e) {
        LOGE("nativeLoadModel: exception: %s", e.what());
    } catch (...) {
        LOGE("nativeLoadModel: unknown exception");
    }
    if (session != nullptr) {
        teardown_session(reinterpret_cast<jlong>(session), true);
    }
    return 0;
}

// Frees the heavy resources but keeps the session struct alive so a later
// nativeFreeModel can delete it. Idempotent.
extern "C" JNIEXPORT void JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmService_nativeUnloadModel(JNIEnv * /* env */, jobject /* thiz */, jlong handle) {
    teardown_session(handle, false);
}

// Deletes the session struct (and any resources nativeUnloadModel left).
// Idempotent.
extern "C" JNIEXPORT void JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmService_nativeFreeModel(JNIEnv * /* env */, jobject /* thiz */, jlong handle) {
    teardown_session(handle, true);
}
