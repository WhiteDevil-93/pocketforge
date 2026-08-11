package com.whitedevil93.pocketforge

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * First Kotlin file in the project. Phase 0 only proves the native toolchain
 * (Kotlin + NDK/CMake + vendored llama.cpp) builds and that a trivial plugin
 * method is callable. No model/server/chat logic lives here yet.
 */
@CapacitorPlugin(name = "LocalLlm")
class LocalLlmPlugin : Plugin() {

    companion object {
        init {
            System.loadLibrary("pokekit-llm")
        }
    }

    @PluginMethod
    fun ping(call: PluginCall) {
        call.resolve(
            JSObject().apply {
                put("message", "pong from LocalLlm")
                put("nativeInfo", nativePing())
            }
        )
    }

    private external fun nativePing(): String
}
