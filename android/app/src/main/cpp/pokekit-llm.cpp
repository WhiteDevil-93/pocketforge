#include <jni.h>
#include <android/log.h>

#include <atomic>
#include <cstdint>
#include <fstream>
#include <mutex>
#include <sstream>
#include <string>
#include <thread>
#include <unordered_set>
#include <vector>

#include <llama.h>

#include <nlohmann/json.hpp>

#include "chat.h"
#include "common.h"

#ifndef LLAMA_CPP_TAG
#define LLAMA_CPP_TAG "unknown"
#endif

#define LOG_TAG "pokekit-llm"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// ---------------------------------------------------------------------------
// Phase 6c tuning knobs (chat template + tool-call parser). Verification
// prep: docs/local-llm-verification.md Section 3. See resolve_chat_template_override()
// and apply_parser_format_override() below.
//
// kChatTemplateOverride - what common_chat_templates_init(model, ...) receives
// as its override. Accepted values at the pinned tag (b10362, common/chat.cpp):
//   ""                     -> the model's embedded template
//                            (tokenizer.chat_template metadata), the default
//   "chatml"               -> built-in chatml Jinja source (special-cased
//                            inside common_chat_templates_init)
//   a file path            -> the file is read and its contents used as the
//                            Jinja template source (mirrors --chat-template-file;
//                            the C API itself does NOT read files)
//   any other non-empty    -> used verbatim as a raw Jinja template source
//
// NOTE: built-in template NAMES (e.g. "gemma") are NOT resolved by the Jinja
// path at this tag - only the legacy llama_chat_apply_template path resolves
// them. To force the stock Gemma template, export its Jinja source to a file
// and point this constant at it (e.g. the models/templates/*.jinja files
// shipped in third_party/llama.cpp). One-line change to flip.
static const char * kChatTemplateOverride = "";

// kParserFormatOverride - single tunable spot for tool-call parsing in
// nativeGenerate. common_chat_templates_apply produces the parser params
// (PEG arena + format) and llama-server feeds them straight into
// common_chat_parse; this generation path does the same. If the default
// parser misses well-formed model output, switch the mapper here:
//   kParserFormatFromApply            -> keep whatever apply() produced
//                                        (recommended default; for the
//                                        Gemma-2 autoparser path this is
//                                        COMMON_CHAT_FORMAT_PEG_NATIVE)
//   COMMON_CHAT_FORMAT_PEG_NATIVE     -> generic PEG AST -> message mapping
//   COMMON_CHAT_FORMAT_PEG_GEMMA4     -> Gemma-4 style mapping
//   COMMON_CHAT_FORMAT_PEG_MINIMAX_M3 -> MiniMax-M3 style mapping
//   COMMON_CHAT_FORMAT_CONTENT_ONLY   -> pure content parser, no tool-call
//                                        extraction (also clears the PEG
//                                        arena, which is what actually selects
//                                        the pure content parser)
// The non-CONTENT_ONLY formats keep apply()'s arena and only change the
// AST -> message mapper. To select a whole different PEG parser, change the
// template/inputs instead - do NOT hand-roll parsing here.
static const common_chat_format kParserFormatFromApply = COMMON_CHAT_FORMAT_COUNT;
static const common_chat_format kParserFormatOverride = kParserFormatFromApply;

// Host-side pre-check for template regressions (no phone needed). Build the
// pinned llama.cpp llama-server on a dev machine and POST one chat completion
// with a tools array against the same GGUF; chat-template and tool-parser
// behaviour reproduces identically there:
//
//   cd third_party/llama.cpp
//   cmake -B build -DLLAMA_CURL=OFF && cmake --build build --target llama-server -j
//   ./build/bin/llama-server -m /path/to/vgc_gemma2.gguf --jinja --host 127.0.0.1 --port 18080
//   curl -s http://127.0.0.1:18080/v1/chat/completions -H 'Content-Type: application/json' -d '{
//     "messages": [{"role":"user","content":"How hard does Focus Blast hit Chansey?"}],
//     "tools": [{"type":"function","function":{"name":"calculate_damage","description":"Compute a damage roll","parameters":{"type":"object","properties":{}}}}],
//     "tool_choice": "auto", "stream": true
//   }'
//   # template regressions reproduce identically; --chat-template-file
//   # <templatePath> is the server-side equivalent of kChatTemplateOverride.
// The model file is not available in this sandbox, so this was documented
// instead of executed (see also docs/local-llm-verification.md Section 3).

// ---------------------------------------------------------------------------

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
// grammar from common_chat_templates_apply (tool-calling formats). Mirrors
// common_sampler_init: a lazy grammar (tool_choice=AUTO) is inserted as
// llama_sampler_init_grammar_lazy_patterns with its trigger markers so the
// model can still answer directly; a regular grammar constrains the whole
// generation.
static llama_sampler * build_sampler_chain(const LlmSession * session, const common_chat_params & chat_params) {
    llama_sampler * chain = llama_sampler_chain_init(llama_sampler_chain_default_params());
    if (chain == nullptr) {
        return nullptr;
    }
    llama_sampler_chain_add(chain, llama_sampler_init_min_p(session->min_p, 1));
    llama_sampler_chain_add(chain, llama_sampler_init_temp(session->temp));
    if (!chat_params.grammar.empty()) {
        llama_sampler * grammar_sampler = nullptr;
        if (chat_params.grammar_lazy) {
            std::vector<std::string> trigger_patterns;
            std::vector<llama_token> trigger_tokens;
            for (const auto & trigger : chat_params.grammar_triggers) {
                switch (trigger.type) {
                    case COMMON_GRAMMAR_TRIGGER_TYPE_WORD:
                        trigger_patterns.push_back(regex_escape(trigger.value));
                        break;
                    case COMMON_GRAMMAR_TRIGGER_TYPE_PATTERN:
                        trigger_patterns.push_back(trigger.value);
                        break;
                    case COMMON_GRAMMAR_TRIGGER_TYPE_PATTERN_FULL: {
                        std::string anchored = "^$";
                        if (!trigger.value.empty()) {
                            anchored = (trigger.value.front() != '^' ? "^" : "") + trigger.value +
                                       (trigger.value.back() != '$' ? "$" : "");
                        }
                        trigger_patterns.push_back(std::move(anchored));
                        break;
                    }
                    case COMMON_GRAMMAR_TRIGGER_TYPE_TOKEN:
                        trigger_tokens.push_back(trigger.token);
                        break;
                }
            }
            std::vector<const char *> trigger_patterns_c;
            trigger_patterns_c.reserve(trigger_patterns.size());
            for (const auto & pattern : trigger_patterns) {
                trigger_patterns_c.push_back(pattern.c_str());
            }
            grammar_sampler = llama_sampler_init_grammar_lazy_patterns(
                llama_model_get_vocab(session->model), chat_params.grammar.c_str(), "root",
                trigger_patterns_c.data(), trigger_patterns_c.size(),
                trigger_tokens.data(), trigger_tokens.size());
        } else {
            grammar_sampler = llama_sampler_init_grammar(
                llama_model_get_vocab(session->model), chat_params.grammar.c_str(), "root");
        }
        if (grammar_sampler == nullptr) {
            llama_sampler_free(chain);
            return nullptr;
        }
        llama_sampler_chain_add(chain, grammar_sampler);
    }
    llama_sampler_chain_add(chain, llama_sampler_init_dist(session->seed));
    return chain;
}

// Returns the length of the longest prefix of s that is valid, complete UTF-8.
// llama_token_to_piece can split one code point across two tokens (e.g. a
// 4-byte emoji), so the tail of the accumulated text may be an incomplete
// multi-byte sequence. We only parse/stream the valid prefix and hold the
// incomplete tail back until the next token completes it.
static size_t utf8_valid_prefix_len(const std::string & s) {
    size_t i = 0;
    const size_t n = s.size();
    while (i < n) {
        const unsigned char c = static_cast<unsigned char>(s[i]);
        size_t seq;
        if (c < 0x80) {
            seq = 1;
        } else if ((c & 0xE0) == 0xC0) {
            seq = 2;
        } else if ((c & 0xF0) == 0xE0) {
            seq = 3;
        } else if ((c & 0xF8) == 0xF0) {
            seq = 4;
        } else {
            return i; // invalid lead byte
        }
        if (i + seq > n) {
            return i; // incomplete at the end - hold back
        }
        for (size_t k = 1; k < seq; ++k) {
            if ((static_cast<unsigned char>(s[i + k]) & 0xC0) != 0x80) {
                return i; // invalid continuation byte
            }
        }
        i += seq;
    }
    return n;
}

// JNI plumbing for the Kotlin GenerationCallback interface. The callback object
// is pinned with a global ref for the whole request; interface methods run on
// the calling (HTTP worker) thread, which is already attached to the JVM, so
// the JNIEnv passed into nativeGenerate is valid for every invocation.
struct GenerationCallback {
    JNIEnv * env = nullptr;
    jobject global = nullptr;
    jmethodID onToken = nullptr;
    jmethodID onToolCallDelta = nullptr;
    jmethodID onDone = nullptr;
    jmethodID onError = nullptr;
};

static bool callback_init(JNIEnv * env, jobject callback, GenerationCallback & cb) {
    cb.env = env;
    cb.global = env->NewGlobalRef(callback);
    if (cb.global == nullptr) {
        LOGE("callback_init: NewGlobalRef failed");
        return false;
    }
    jclass clazz = env->GetObjectClass(callback);
    if (clazz == nullptr) {
        LOGE("callback_init: GetObjectClass failed");
        env->DeleteGlobalRef(cb.global);
        cb.global = nullptr;
        return false;
    }
    cb.onToken = env->GetMethodID(clazz, "onToken", "(Ljava/lang/String;)V");
    cb.onToolCallDelta = env->GetMethodID(clazz, "onToolCallDelta", "(ILjava/lang/String;Ljava/lang/String;)V");
    cb.onDone = env->GetMethodID(clazz, "onDone", "(Ljava/lang/String;Ljava/lang/String;)V");
    cb.onError = env->GetMethodID(clazz, "onError", "(Ljava/lang/String;)V");
    env->DeleteLocalRef(clazz);
    if (cb.onToken == nullptr || cb.onToolCallDelta == nullptr || cb.onDone == nullptr || cb.onError == nullptr) {
        LOGE("callback_init: failed to resolve callback methods");
        env->DeleteGlobalRef(cb.global);
        cb.global = nullptr;
        return false;
    }
    return true;
}

static void callback_free(GenerationCallback & cb) {
    if (cb.global != nullptr) {
        cb.env->DeleteGlobalRef(cb.global);
        cb.global = nullptr;
    }
}

// Describes and clears a pending Java exception so a Kotlin callback that threw
// (e.g. the socket died under the SSE write) does not crash the process through
// an unchecked JNI exception. Returns the exception message (possibly empty).
static std::string callback_clear_exception(JNIEnv * env) {
    if (!env->ExceptionCheck()) {
        return "";
    }
    jthrowable exc = env->ExceptionOccurred();
    env->ExceptionClear();
    std::string msg;
    jclass clazz = env->GetObjectClass(exc);
    jmethodID getMessage = env->GetMethodID(clazz, "getMessage", "()Ljava/lang/String;");
    if (getMessage != nullptr) {
        jstring jmsg = static_cast<jstring>(env->CallObjectMethod(exc, getMessage));
        if (jmsg != nullptr) {
            const char * cmsg = env->GetStringUTFChars(jmsg, nullptr);
            if (cmsg != nullptr) {
                msg = cmsg;
                env->ReleaseStringUTFChars(jmsg, cmsg);
            }
            env->DeleteLocalRef(jmsg);
        }
    }
    env->DeleteLocalRef(clazz);
    env->DeleteLocalRef(exc);
    return msg;
}

// Invokes callback.onToken. Returns false (and clears any Java exception) if
// the Kotlin side raised, e.g. its socket write failed.
static bool callback_on_token(GenerationCallback & cb, const std::string & piece) {
    jstring jstr = cb.env->NewStringUTF(piece.c_str());
    cb.env->CallVoidMethod(cb.global, cb.onToken, jstr);
    cb.env->DeleteLocalRef(jstr);
    if (cb.env->ExceptionCheck()) {
        LOGE("callback_on_token: Kotlin callback raised: %s", callback_clear_exception(cb.env).c_str());
        return false;
    }
    return true;
}

// Invokes callback.onToolCallDelta(index, nameDelta, argsDelta).
static bool callback_on_tool_call_delta(GenerationCallback & cb, int index,
                                        const std::string & name_delta, const std::string & args_delta) {
    jstring jname = cb.env->NewStringUTF(name_delta.c_str());
    jstring jargs = cb.env->NewStringUTF(args_delta.c_str());
    cb.env->CallVoidMethod(cb.global, cb.onToolCallDelta, index, jname, jargs);
    cb.env->DeleteLocalRef(jargs);
    cb.env->DeleteLocalRef(jname);
    if (cb.env->ExceptionCheck()) {
        LOGE("callback_on_tool_call_delta: Kotlin callback raised: %s", callback_clear_exception(cb.env).c_str());
        return false;
    }
    return true;
}

// Invokes callback.onDone(content, toolCallsJson).
static bool callback_on_done(GenerationCallback & cb, const std::string & content, const std::string & tool_calls_json) {
    jstring jcontent = cb.env->NewStringUTF(content.c_str());
    jstring jcalls = cb.env->NewStringUTF(tool_calls_json.c_str());
    cb.env->CallVoidMethod(cb.global, cb.onDone, jcontent, jcalls);
    cb.env->DeleteLocalRef(jcalls);
    cb.env->DeleteLocalRef(jcontent);
    if (cb.env->ExceptionCheck()) {
        LOGE("callback_on_done: Kotlin callback raised: %s", callback_clear_exception(cb.env).c_str());
        return false;
    }
    return true;
}

// Invokes callback.onError(message).
static bool callback_on_error(GenerationCallback & cb, const std::string & message) {
    jstring jmsg = cb.env->NewStringUTF(message.c_str());
    cb.env->CallVoidMethod(cb.global, cb.onError, jmsg);
    cb.env->DeleteLocalRef(jmsg);
    if (cb.env->ExceptionCheck()) {
        LOGE("callback_on_error: Kotlin callback raised: %s", callback_clear_exception(cb.env).c_str());
        return false;
    }
    return true;
}

// Serializes a vector of parsed tool calls to the OpenAI wire shape:
// [{"id":...,"type":"function","function":{"name":...,"arguments":...}}].
static std::string tool_calls_to_json(const std::vector<common_chat_tool_call> & tool_calls) {
    nlohmann::ordered_json arr = nlohmann::ordered_json::array();
    for (const auto & call : tool_calls) {
        nlohmann::ordered_json fn = nlohmann::ordered_json::object();
        if (!call.name.empty()) {
            fn["name"] = call.name;
        }
        if (!call.arguments.empty()) {
            fn["arguments"] = call.arguments;
        }
        nlohmann::ordered_json entry = nlohmann::ordered_json::object();
        if (!call.id.empty()) {
            entry["id"] = call.id;
        }
        entry["type"] = "function";
        entry["function"] = std::move(fn);
        arr.push_back(std::move(entry));
    }
    return arr.dump();
}

// Resolves kChatTemplateOverride to the string passed to
// common_chat_templates_init. "" stays "" (the model's embedded template is
// used). A non-empty value is first tried as a file path (the contents become
// the Jinja template source, mirroring --chat-template-file); if the file
// cannot be read the value is passed through verbatim (so "chatml" and raw
// Jinja sources keep working).
static std::string resolve_chat_template_override() {
    if (kChatTemplateOverride == nullptr || kChatTemplateOverride[0] == '\0') {
        return "";
    }
    std::ifstream file(kChatTemplateOverride);
    if (file) {
        std::ostringstream ss;
        ss << file.rdbuf();
        return ss.str();
    }
    LOGW("resolve_chat_template_override: not a readable file, using value verbatim: %s", kChatTemplateOverride);
    return kChatTemplateOverride;
}

// Overrides parser_params.format with kParserFormatOverride unless it is set
// to the kParserFormatFromApply sentinel. COMMON_CHAT_FORMAT_CONTENT_ONLY also
// clears the PEG arena - common_chat_parse uses the pure content parser only
// when the arena is empty - and disables tool-call extraction. Everything else
// keeps apply()'s arena and only changes the AST -> message mapper.
static void apply_parser_format_override(common_chat_parser_params & parser_params) {
    if (kParserFormatOverride == kParserFormatFromApply) {
        return;
    }
    LOGI("apply_parser_format_override: switching parser format from %s to %s",
         common_chat_format_name(parser_params.format), common_chat_format_name(kParserFormatOverride));
    parser_params.format = kParserFormatOverride;
    if (kParserFormatOverride == COMMON_CHAT_FORMAT_CONTENT_ONLY) {
        parser_params.parser = common_peg_arena();
        parser_params.parse_tool_calls = false;
    }
}

// Cuts a long diagnostic string (e.g. an embedded Jinja template) down to the
// first max_len characters with a marker, so logcat lines stay readable.
static std::string truncate_for_log(const std::string & s, size_t max_len = 2048) {
    if (s.size() <= max_len) {
        return s;
    }
    return s.substr(0, max_len) + "...<truncated, full length " + std::to_string(s.size()) + ">";
}

// Chat-template diagnostics logged at model load (Phase 6c). Logs the override
// in use, whether the embedded template was used, the template source(s)
// actually in use, the model's raw tokenizer.chat_template metadata, and - for
// a representative tool-calling request - the common_chat_format chosen by
// common_chat_templates_apply and whether it produced a grammar. The
// representative apply is diagnostic-only: it cannot fail the load.
static void log_chat_template_diagnostics(const LlmSession * session) {
    const bool was_explicit = common_chat_templates_was_explicit(session->tmpls.get());
    const std::string source = common_chat_templates_source(session->tmpls.get());
    const std::string source_tool_use = common_chat_templates_source(session->tmpls.get(), "tool_use");

    LOGI("nativeLoadModel: chat template override=%s", truncate_for_log(resolve_chat_template_override()).c_str());
    LOGI("nativeLoadModel: chat template was_explicit=%d", was_explicit ? 1 : 0);
    LOGI("nativeLoadModel: chat template source=%s", truncate_for_log(source).c_str());
    if (!source_tool_use.empty() && source_tool_use != source) {
        LOGI("nativeLoadModel: chat template source (tool_use)=%s", truncate_for_log(source_tool_use).c_str());
    }

    char meta_buf[8192];
    const int meta_len = llama_model_meta_val_str(session->model, "tokenizer.chat_template", meta_buf, sizeof(meta_buf));
    if (meta_len >= 0) {
        LOGI("nativeLoadModel: model tokenizer.chat_template=%s",
             truncate_for_log(std::string(meta_buf, meta_len)).c_str());
    } else {
        LOGW("nativeLoadModel: model tokenizer.chat_template not found in metadata");
    }

    try {
        common_chat_templates_inputs inputs;
        common_chat_msg user_msg;
        user_msg.role = "user";
        user_msg.content = "How hard does Focus Blast hit Chansey?";
        inputs.messages = { user_msg };
        nlohmann::ordered_json fn = nlohmann::ordered_json::object();
        fn["type"] = "function";
        nlohmann::ordered_json f = nlohmann::ordered_json::object();
        f["name"] = "calculate_damage";
        f["description"] = "Compute a damage roll";
        f["parameters"] = nlohmann::ordered_json::object({
            {"type", "object"},
            {"properties", nlohmann::ordered_json::object()},
        });
        fn["function"] = std::move(f);
        inputs.tools = common_chat_tools_parse_oaicompat(nlohmann::ordered_json::array({fn}));
        inputs.tool_choice = COMMON_CHAT_TOOL_CHOICE_AUTO;
        inputs.add_generation_prompt = true;
        inputs.use_jinja = true;

        const common_chat_params chat_params = common_chat_templates_apply(session->tmpls.get(), inputs);
        LOGI("nativeLoadModel: representative apply format=%s grammar=%s",
             common_chat_format_name(chat_params.format),
             chat_params.grammar.empty() ? "empty" : "present");
    } catch (const std::exception & e) {
        LOGW("nativeLoadModel: representative chat template apply failed (diagnostic only): %s", e.what());
    }
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

        // An empty registry means the build linked ggml without a statically
        // registered backend (GGML_BACKEND_DL=ON builds them as dlopen-only
        // MODULEs that never reach the APK). llama_model_load_from_file would
        // fail further in with a far less obvious message, so stop here.
        const size_t n_reg = ggml_backend_reg_count();
        const size_t n_dev = ggml_backend_dev_count();
        LOGI("nativeLoadModel: ggml backends=%zu devices=%zu", n_reg, n_dev);
        if (n_dev == 0) {
            LOGE("nativeLoadModel: no ggml backend registered — check that "
                 "GGML_BACKEND_DL/GGML_CPU_ALL_VARIANTS are OFF in build.gradle");
            return 0;
        }

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

        // Sanity-check the default sampler chain at load; generation rebuilds
        // its own per-request chain (with the grammar sampler when needed).
        common_chat_params default_chat_params;
        session->sampler = build_sampler_chain(session, default_chat_params);
        if (session->sampler == nullptr) {
            LOGE("nativeLoadModel: failed to build sampler chain");
            teardown_session(handle, true);
            return 0;
        }

        // "" (kChatTemplateOverride default) = the model's own embedded
        // template first; see resolve_chat_template_override() for the
        // accepted override values.
        session->tmpls = common_chat_templates_init(session->model, resolve_chat_template_override());
        if (!session->tmpls) {
            LOGE("nativeLoadModel: failed to init chat templates");
            teardown_session(handle, true);
            return 0;
        }

        // Phase 6c diagnostics: which template is actually in use and what the
        // representative tool-calling request maps to (format + grammar).
        log_chat_template_diagnostics(session);

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

// Sets the session's cancellation flag. Deliberately lock-free: it is called
// from the SSE write path on the same thread as nativeGenerate (client
// disconnect) and from the Kotlin stop path, and must never block behind the
// generateMutex the in-flight generation holds (that would deadlock against
// teardown_session, which holds the registry mutex while waiting on
// generateMutex). Memory safety relies on the Kotlin contract: nativeCancel is
// only invoked while the session is alive - from the generation callback (the
// session cannot be torn down under the running generation) or immediately
// before nativeUnloadModel/nativeFreeModel on the same thread.
extern "C" JNIEXPORT void JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmService_nativeCancel(JNIEnv * /* env */, jobject /* thiz */, jlong handle) {
    if (handle == 0) {
        return;
    }
    auto * session = reinterpret_cast<LlmSession *>(handle);
    session->cancelled = true;
}

// Runs one real llama.cpp generation for an OpenAI-shaped chat completion
// request and streams the result back through the Kotlin GenerationCallback:
//   onToken(contentDelta)          - parsed content delta (diff streaming)
//   onToolCallDelta(i, n, a)       - tool-call deltas keyed by array position
//   onDone(content, toolCallsJson) - final structured result
//   onError(message)               - any failure
//
// Streaming strategy (mirrors llama-server's server-task.cpp): the raw
// generated text is re-parsed with common_chat_parse(..., is_partial=true)
// after every token and common_chat_msg_diff::compute_diffs() turns the new
// parse into content/tool-call deltas. Template markers never leak into the
// content deltas because the parser strips them. If the diff step ever throws
// (parser revisions a tool-call name in a way compute_diffs rejects), we fall
// back to raw-piece streaming plus one final tool_calls delta at the end, as
// the plan allows.
extern "C" JNIEXPORT void JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmService_nativeGenerate(
    JNIEnv * env, jobject /* thiz */, jlong handle, jstring jRequestBodyJson, jobject callback) {
    if (jRequestBodyJson == nullptr || callback == nullptr) {
        LOGE("nativeGenerate: null request body or callback");
        return;
    }
    auto * session = reinterpret_cast<LlmSession *>(handle);
    {
        std::lock_guard<std::mutex> reg_lock(g_registry_mutex);
        if (g_live_sessions.count(session) == 0) {
            LOGE("nativeGenerate: unknown session handle");
            return;
        }
    }

    GenerationCallback cb;
    if (!callback_init(env, callback, cb)) {
        LOGE("nativeGenerate: callback init failed");
        return;
    }

    std::string body_json;
    {
        const char * cjson = env->GetStringUTFChars(jRequestBodyJson, nullptr);
        if (cjson == nullptr) {
            LOGE("nativeGenerate: GetStringUTFChars failed");
            callback_free(cb);
            return;
        }
        body_json = cjson;
        env->ReleaseStringUTFChars(jRequestBodyJson, cjson);
    }

    llama_sampler * smpl = nullptr;
    try {
        nlohmann::ordered_json body = nlohmann::ordered_json::parse(body_json);

        common_chat_templates_inputs inputs;
        inputs.messages = common_chat_msgs_parse_oaicompat(body.at("messages"));
        if (body.contains("tools") && body.at("tools").is_array()) {
            inputs.tools = common_chat_tools_parse_oaicompat(body.at("tools"));
        }
        // tool_choice: "auto" (default) / "none" / "required" / {"type": ...}
        if (body.contains("tool_choice")) {
            const nlohmann::ordered_json & tc = body.at("tool_choice");
            if (tc.is_string()) {
                inputs.tool_choice = common_chat_tool_choice_parse_oaicompat(tc.get<std::string>());
            } else if (tc.is_object() && tc.contains("type") && tc.at("type").is_string()) {
                inputs.tool_choice = common_chat_tool_choice_parse_oaicompat(tc.at("type").get<std::string>());
            }
        }
        inputs.add_generation_prompt = true;
        inputs.use_jinja = true;

        common_chat_params chat_params = common_chat_templates_apply(session->tmpls.get(), inputs);

        int n_predict = 1024;
        if (body.contains("max_tokens") && body.at("max_tokens").is_number_integer()) {
            n_predict = body.at("max_tokens").get<int>();
            if (n_predict < 1) {
                n_predict = 1;
            }
        }

        const llama_vocab * vocab = llama_model_get_vocab(session->model);
        if (vocab == nullptr) {
            throw std::runtime_error("model has no vocab");
        }

        llama_tokens prompt_tokens = common_tokenize(vocab, chat_params.prompt, true, true);
        if (prompt_tokens.empty()) {
            throw std::runtime_error("failed to tokenize the chat prompt");
        }
        LOGI("nativeGenerate: prompt=%zu tokens, n_predict=%d, format=%s, grammar=%s",
             prompt_tokens.size(), n_predict, common_chat_format_name(chat_params.format),
             chat_params.grammar.empty() ? "empty" : "present");

        // Per-request sampler chain: session defaults + grammar sampler when the
        // template produced a grammar (tool-calling formats).
        smpl = build_sampler_chain(session, chat_params);
        if (smpl == nullptr) {
            throw std::runtime_error("failed to build the sampler chain");
        }

        // Parser params feed both the partial (streaming) and the final parse.
        // Derive from apply()'s output exactly like llama-server does, then
        // apply the single tunable parser-selection knob (Phase 6c).
        common_chat_parser_params parser_params(chat_params);
        parser_params.parse_tool_calls = !inputs.tools.empty();
        if (!chat_params.parser.empty()) {
            parser_params.parser.load(chat_params.parser);
        }
        apply_parser_format_override(parser_params);

        // Serialize overlapping requests: the whole decode loop (and cleanup)
        // holds generateMutex so concurrent /v1/chat/completions requests queue
        // instead of corrupting the shared context.
        std::lock_guard<std::mutex> gen_lock(session->generateMutex);
        session->cancelled = false;

        // Each request carries the whole conversation and the chat template
        // re-renders it from scratch, so the context has to start empty. Without
        // this the prompt is decoded on top of the previous request's KV cache:
        // the tool-calling loop sends one request per round trip (up to
        // MAX_TOOL_ITERATIONS per user message), each stacking another full
        // transcript on the last, so the model reads a conversation spliced from
        // duplicated turns, starts echoing raw <start_of_turn> markers as content,
        // and fills the context long before it answers.
        llama_memory_clear(llama_get_memory(session->ctx), true);

        const int32_t n_ctx_total = static_cast<int32_t>(llama_n_ctx(session->ctx));
        if (static_cast<int32_t>(prompt_tokens.size()) >= n_ctx_total) {
            throw std::runtime_error("the conversation is longer than the model's context window");
        }

        llama_batch batch = llama_batch_get_one(prompt_tokens.data(), static_cast<int32_t>(prompt_tokens.size()));

        std::string generated_text; // raw pieces, may end in an incomplete UTF-8 tail
        std::string parsed_text;    // complete-UTF-8 prefix of generated_text fed to the parser
        common_chat_msg parsed_msg; // previous partial parse, for diffing
        bool diff_streaming = true;
        size_t raw_sent_len = 0;   // bytes of parsed_text already streamed raw (fallback mode)
        bool suppress_raw = false; // fallback mode: stop emitting raw content once tool calls parse
        int n_generated = 0;

        while (true) {
            if (session->cancelled) {
                LOGI("nativeGenerate: cancelled, stopping after %d tokens", n_generated);
                break;
            }
            const int32_t n_ctx = static_cast<int32_t>(llama_n_ctx(session->ctx));
            const llama_pos pos_max = llama_memory_seq_pos_max(llama_get_memory(session->ctx), 0);
            if (pos_max >= 0 && pos_max + 1 + batch.n_tokens > n_ctx) {
                LOGW("nativeGenerate: context full, stopping after %d tokens", n_generated);
                break;
            }
            if (llama_decode(session->ctx, batch) != 0) {
                throw std::runtime_error("llama_decode failed");
            }
            // Non-const so it can be passed to llama_batch_get_one (which takes
            // llama_token *); the batch only reads the token.
            llama_token tok = llama_sampler_sample(smpl, session->ctx, -1);
            if (llama_vocab_is_eog(vocab, tok)) {
                break;
            }
            char buf[256];
            const int n = llama_token_to_piece(vocab, tok, buf, sizeof(buf), 0, true);
            if (n < 0) {
                throw std::runtime_error("llama_token_to_piece failed");
            }
            generated_text.append(buf, n);
            n_generated++;
            if (n_generated >= n_predict) {
                break;
            }

            const size_t valid_len = utf8_valid_prefix_len(generated_text);
            parsed_text = generated_text.substr(0, valid_len);
            if (parsed_text.empty()) {
                continue; // multi-byte continuation not complete yet
            }

            if (diff_streaming) {
                try {
                    common_chat_msg new_msg = common_chat_parse(parsed_text, true, parser_params);
                    std::vector<common_chat_msg_diff> diffs =
                        common_chat_msg_diff::compute_diffs(parsed_msg, new_msg);
                    for (const auto & diff : diffs) {
                        if (!diff.content_delta.empty()) {
                            if (!callback_on_token(cb, diff.content_delta)) {
                                session->cancelled = true;
                                break;
                            }
                            if (session->cancelled) {
                                break;
                            }
                        }
                        if (diff.tool_call_index != std::string::npos &&
                            (!diff.tool_call_delta.name.empty() || !diff.tool_call_delta.arguments.empty())) {
                            if (!callback_on_tool_call_delta(cb, static_cast<int>(diff.tool_call_index),
                                                             diff.tool_call_delta.name, diff.tool_call_delta.arguments)) {
                                session->cancelled = true;
                                break;
                            }
                        }
                    }
                    parsed_msg = std::move(new_msg);
                } catch (const std::exception & e) {
                    LOGW("nativeGenerate: diff streaming failed, falling back to raw: %s", e.what());
                    diff_streaming = false;
                    // Diff deltas already covered everything parsed so far; do
                    // not re-stream it raw or the content would be duplicated.
                    raw_sent_len = parsed_text.size();
                }
            }

            if (!diff_streaming) {
                // Fallback: stream raw pieces, but stop once the model starts
                // emitting tool-call text so template markers do not flood the
                // chat bubble.
                common_chat_msg probe;
                try {
                    probe = common_chat_parse(parsed_text, true, parser_params);
                } catch (const std::exception & e) {
                    LOGW("nativeGenerate: fallback parse failed: %s", e.what());
                }
                if (!probe.tool_calls.empty()) {
                    suppress_raw = true;
                }
                if (!suppress_raw && valid_len > raw_sent_len) {
                    const std::string piece = parsed_text.substr(raw_sent_len);
                    raw_sent_len = valid_len;
                    if (!callback_on_token(cb, piece)) {
                        session->cancelled = true;
                        break;
                    }
                }
            }

            batch = llama_batch_get_one(&tok, 1);
        }

        // Final parse with is_partial=false: authoritative content + tool_calls.
        common_chat_msg final_msg = common_chat_parse(parsed_text, false, parser_params);
        if (diff_streaming) {
            try {
                for (const auto & diff : common_chat_msg_diff::compute_diffs(parsed_msg, final_msg)) {
                    if (!diff.content_delta.empty()) {
                        if (!callback_on_token(cb, diff.content_delta)) {
                            session->cancelled = true;
                            break;
                        }
                    }
                    if (diff.tool_call_index != std::string::npos &&
                        (!diff.tool_call_delta.name.empty() || !diff.tool_call_delta.arguments.empty())) {
                        if (!callback_on_tool_call_delta(cb, static_cast<int>(diff.tool_call_index),
                                                         diff.tool_call_delta.name, diff.tool_call_delta.arguments)) {
                            session->cancelled = true;
                            break;
                        }
                    }
                }
            } catch (const std::exception & e) {
                // The strict final parse can disagree with the last partial
                // parse (e.g. it drops a tool call the partial one captured).
                // Emit the final calls as one delta each rather than failing
                // the whole turn with an error frame.
                LOGW("nativeGenerate: final diff failed, emitting final tool calls: %s", e.what());
                for (size_t i = 0; i < final_msg.tool_calls.size(); ++i) {
                    if (!callback_on_tool_call_delta(cb, static_cast<int>(i), final_msg.tool_calls[i].name,
                                                     final_msg.tool_calls[i].arguments)) {
                        session->cancelled = true;
                        break;
                    }
                }
            }
        } else if (!suppress_raw) {
            // Fallback: emit any trailing content the raw stream has not sent yet.
            const size_t valid_len = utf8_valid_prefix_len(parsed_text);
            if (valid_len > raw_sent_len) {
                callback_on_token(cb, parsed_text.substr(raw_sent_len));
            }
        }

        callback_on_done(cb, final_msg.content, tool_calls_to_json(final_msg.tool_calls));
    } catch (const std::exception & e) {
        LOGE("nativeGenerate: exception: %s", e.what());
        callback_on_error(cb, e.what());
    } catch (...) {
        LOGE("nativeGenerate: unknown exception");
        callback_on_error(cb, "unknown native error");
    }

    if (smpl != nullptr) {
        llama_sampler_free(smpl);
    }
    callback_free(cb);
}
