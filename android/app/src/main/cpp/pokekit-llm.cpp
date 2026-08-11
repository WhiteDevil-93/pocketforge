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

extern "C" JNIEXPORT jboolean JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmService_nativeLoadModel(JNIEnv *env, jobject /* thiz */, jstring jPath) {
    const char *cPath = env->GetStringUTFChars(jPath, nullptr);
    std::string path = cPath ? cPath : "";
    if (cPath) env->ReleaseStringUTFChars(jPath, cPath);
    (void) path;
    return JNI_TRUE;
}

extern "C" JNIEXPORT void JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmService_nativeUnloadModel(JNIEnv *env, jobject /* thiz */) {
    (void) env;
}

extern "C" JNIEXPORT void JNICALL
Java_com_whitedevil93_pocketforge_LocalLlmService_nativeFreeModel(JNIEnv *env, jobject /* thiz */) {
    (void) env;
}
