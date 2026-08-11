// Phase 0 trivial JNI shim: proves Kotlin -> JNI -> llama.cpp linkage works.
// No model/server/chat logic yet.
#include <jni.h>
#include <string>

#include <llama.h>

#ifndef LLAMA_CPP_TAG
#define LLAMA_CPP_TAG "unknown"
#endif

extern "C" JNIEXPORT jstring JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmPlugin_nativePing(JNIEnv *env, jobject /* thiz */) {
    std::string info = "pokekit-llm JNI shim OK | llama.cpp tag: ";
    info += LLAMA_CPP_TAG;
    info += " | backends: ";
    info += llama_print_system_info();
    return env->NewStringUTF(info.c_str());
}
