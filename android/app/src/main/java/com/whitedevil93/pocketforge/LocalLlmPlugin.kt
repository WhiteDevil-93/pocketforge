package com.whitedevil93.pocketforge

import android.app.Activity
import android.content.ContentResolver
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import androidx.activity.result.ActivityResult
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.BufferedReader
import java.io.File
import java.io.FileOutputStream
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.StandardCharsets
import java.util.TreeMap
import kotlin.math.roundToInt
import org.json.JSONArray
import org.json.JSONObject

/**
 * Native bridge for the on-device llama.cpp backend.
 *
 * Phase 0 added the toolchain + a trivial [ping]. Phase 1 adds [pickModelFile],
 * which imports a GGUF model from the SAF document picker into app-private
 * storage. No server/inference logic yet.
 */
@CapacitorPlugin(name = "LocalLlm")
class LocalLlmPlugin : Plugin() {

    companion object {
        init {
            System.loadLibrary("pokekit-llm")
        }

        private const val TAG = "LocalLlmPlugin"

        /** Must match the [ActivityCallback]-annotated method name. */
        private const val PICK_MODEL_CALLBACK = "onPickModelResult"

        /** GGUF files start with the ASCII magic "GGUF" at offset 0. */
        private const val GGUF_MAGIC = "GGUF"

        /** A real GGUF model is far larger; anything below this is not a model. */
        private const val MIN_MODEL_BYTES = 1024L * 1024L

        /** 256 KiB streaming buffer — never buffer the whole (multi-GB) file. */
        private const val COPY_BUFFER_SIZE = 256 * 1024

        /** How long to wait for the local llama-server to accept the connection. */
        private const val CONNECT_TIMEOUT_MS = 10_000

        /** Read timeout between SSE chunks — tokens keep arriving while the model
         *  generates, so this only trips if the server truly stalls mid-turn. */
        private const val READ_TIMEOUT_MS = 300_000

        /** Absolute ceiling for one chatOnce stream, protecting against a server that
         *  accepts the request and then never emits [DONE]. */
        private const val STREAM_BUDGET_MS = 600_000
    }

    /** Accumulates one OpenAI tool call across the streamed chunks that fragment it.
     *  OpenAI keys fragments by ARRAY POSITION in delta.tool_calls, so one logical
     *  call's name/argument JSON arrives spread over many SSE chunks — appending by
     *  index reassembles them. */
    private class ToolCallAccumulator {
        var id: String? = null
        val name = StringBuilder()
        val arguments = StringBuilder()
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

    /**
     * Opens the system document picker (SAF, ACTION_OPEN_DOCUMENT) so the user can
     * select the GGUF model. SAF hands back a content:// Uri directly — no storage
     * permission needed, and direct-path Downloads access is blocked on API 30+.
     *
     * The result arrives in [onPickModelResult] (see Capacitor 8's ActivityCallback
     * contract below) and the copy runs on a background thread; the call resolves
     * only once the model is validated, copied, and in place under filesDir.
     */
    @PluginMethod
    fun pickModelFile(call: PluginCall) {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
        }
        // Capacitor 8 (verified against the installed @capacitor/android@8.5.0
        // Plugin.java): startActivityForResult(call, intent, callbackName) saves the
        // call and launches a registered ActivityResultLauncher; the callback method
        // annotated @ActivityCallback(call: PluginCall, result: ActivityResult) is
        // invoked with the result. The old requestCode overload is deprecated.
        startActivityForResult(call, intent, PICK_MODEL_CALLBACK)
    }

    @ActivityCallback
    private fun onPickModelResult(call: PluginCall, result: ActivityResult) {
        if (result.resultCode != Activity.RESULT_OK) {
            call.reject("Model file picker was cancelled")
            return
        }
        val uri = result.data?.data
        if (uri == null) {
            call.reject("Model file picker returned no file")
            return
        }
        importModel(call, uri)
    }

    private fun importModel(call: PluginCall, uri: Uri) {
        val appContext = context
        if (appContext == null) {
            call.reject("Plugin context is unavailable")
            return
        }
        val activity = getActivity()
        val resolver = appContext.contentResolver
        val totalBytes = querySize(resolver, uri)
        if (totalBytes != null && totalBytes < MIN_MODEL_BYTES) {
            call.reject("Selected file is only $totalBytes bytes; expected a GGUF model of at least $MIN_MODEL_BYTES bytes")
            return
        }

        val safeName = sanitizeFileName(queryDisplayName(resolver, uri) ?: "model.gguf")
        val destination = File(appContext.filesDir, safeName)

        // The copy is a real-time operation for a 2.78 GB file; never block the
        // plugin-call (main) thread.
        Thread({
            var partial: File? = null
            try {
                val partialFile = File(appContext.filesDir, "$safeName.partial")
                partial = partialFile
                val bytesCopied = copyInChunks(resolver, uri, partialFile, totalBytes, activity)
                if (bytesCopied < MIN_MODEL_BYTES) {
                    throw IllegalStateException("Copied file is only $bytesCopied bytes; too small to be a GGUF model")
                }
                if (destination.exists()) {
                    destination.delete()
                }
                if (!partialFile.renameTo(destination)) {
                    throw IllegalStateException("Could not finalize the model file in app storage")
                }
                val result = JSObject().apply {
                    put("path", destination.absolutePath)
                    put("name", safeName)
                    put("size", bytesCopied)
                }
                activity.runOnUiThread { call.resolve(result) }
            } catch (e: Exception) {
                val message = e.message ?: "Failed to import the model file"
                activity.runOnUiThread { call.reject(message) }
            } finally {
                partial?.let { if (it.exists()) it.delete() }
            }
        }, "llm-model-import").start()
    }

    /**
     * Streams [uri] into [destination] in fixed-size chunks, validating the GGUF
     * magic before writing anything. Emits throttled modelImportProgress events.
     * Returns the number of bytes copied. Never loads the file into memory.
     */
    private fun copyInChunks(
        resolver: ContentResolver,
        uri: Uri,
        destination: File,
        totalBytes: Long?,
        activity: Activity,
    ): Long {
        val inputStream = resolver.openInputStream(uri)
            ?: throw IllegalStateException("Unable to open the selected file")
        inputStream.use { rawInput ->
            BufferedInputStream(rawInput).use { input ->
                // GGUF spec: the first four bytes are the magic, ASCII "GGUF".
                val magic = ByteArray(GGUF_MAGIC.length)
                var magicRead = 0
                while (magicRead < magic.size) {
                    val read = input.read(magic, magicRead, magic.size - magicRead)
                    if (read == -1) break
                    magicRead += read
                }
                if (magicRead < magic.size || String(magic, Charsets.US_ASCII) != GGUF_MAGIC) {
                    throw IllegalArgumentException("Not a GGUF model: the file does not start with the 'GGUF' magic bytes")
                }

                var bytesCopied = magicRead.toLong()
                var lastReportedPercent = -1
                var lastReportedBytes = 0L
                FileOutputStream(destination).use { rawOutput ->
                    BufferedOutputStream(rawOutput).use { output ->
                        output.write(magic, 0, magicRead)
                        val buffer = ByteArray(COPY_BUFFER_SIZE)
                        while (true) {
                            val read = input.read(buffer)
                            if (read == -1) break
                            output.write(buffer, 0, read)
                            bytesCopied += read
                            if (emitProgress(bytesCopied, totalBytes, lastReportedPercent, lastReportedBytes, activity)) {
                                lastReportedPercent = percentOf(bytesCopied, totalBytes)
                                lastReportedBytes = bytesCopied
                            }
                        }
                        output.flush()
                    }
                }
                return bytesCopied
            }
        }
    }

    /**
     * Emits a throttled modelImportProgress event. Returns true if an event was
     * emitted, false if throttled. Throttles on percent change when totalBytes is
     * known; otherwise emits at most every 1 MiB.
     */
    private fun emitProgress(
        bytesCopied: Long,
        totalBytes: Long?,
        lastPercent: Int,
        lastBytes: Long,
        activity: Activity,
    ): Boolean {
        if (totalBytes != null && totalBytes > 0) {
            val percent = percentOf(bytesCopied, totalBytes)
            if (percent == lastPercent) return false
            notifyProgress(activity, bytesCopied, totalBytes, percent)
            return true
        }
        // Unknown size: report at most every 1 MiB.
        if (bytesCopied - lastBytes < 1024L * 1024L) return false
        notifyProgress(activity, bytesCopied, -1L, 0)
        return true
    }

    private fun notifyProgress(activity: Activity, bytesCopied: Long, totalBytes: Long, percent: Int) {
        activity.runOnUiThread {
            val data = JSObject().apply {
                put("bytesCopied", bytesCopied)
                put("totalBytes", totalBytes)
                put("percent", percent)
            }
            notifyListeners("modelImportProgress", data)
        }
    }

    private fun percentOf(bytesCopied: Long, totalBytes: Long?): Int {
        if (totalBytes == null || totalBytes <= 0) return 0
        return ((bytesCopied.toDouble() / totalBytes.toDouble()) * 100.0).roundToInt()
    }

    private fun queryDisplayName(resolver: ContentResolver, uri: Uri): String? {
        return resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) cursor.getString(0) else null
        }
    }

    private fun querySize(resolver: ContentResolver, uri: Uri): Long? {
        return resolver.openAssetFileDescriptor(uri, "r")?.use { descriptor ->
            // AssetFileDescriptor.length() can be UNKNOWN_LENGTH (-1); treat that
            // as "unknown" rather than rejecting the file.
            val length = descriptor.length
            if (length >= 0) length else null
        }
    }

    private fun sanitizeFileName(name: String): String {
        val sanitized = name.replace(Regex("[/\\\\]"), "_").trim()
        return if (sanitized.isBlank()) "model.gguf" else sanitized
    }

    private external fun nativePing(): String

    // ------------------------------------------------------------------
    // Phase 2: server lifecycle — start/stop/status bridged to LocalLlmService.
    // The service owns all state; the plugin only translates PluginCall ↔ Service.
    // Never block the plugin-call thread on model load — startServer returns
    // immediately with state 'loading' and lets serverStatusChanged events /
    // polling convey readiness.
    // ------------------------------------------------------------------

    override fun load() {
        super.load()
        LocalLlmService.statusListener = { state, port, error ->
            val data = JSObject().apply {
                put("state", state)
                if (port != null) put("port", port)
                if (error != null) put("error", error)
            }
            notifyListeners("serverStatusChanged", data)
        }
    }

    private fun statusToJSObject(snapshot: Map<String, Any?>): JSObject {
        return JSObject().apply {
            put("state", snapshot["state"] as? String ?: "stopped")
            (snapshot["port"] as? Int)?.let { put("port", it) }
            (snapshot["error"] as? String)?.let { put("error", it) }
        }
    }

    @PluginMethod
    fun startServer(call: PluginCall) {
        val ctx = context
        if (ctx == null) {
            call.reject("Plugin context unavailable")
            return
        }
        var modelPath = call.getString("modelPath")
        if (modelPath.isNullOrBlank()) {
            val filesDir = ctx.filesDir
            val discovered = filesDir.listFiles()?.firstOrNull { it.name.endsWith(".gguf", ignoreCase = true) }
            if (discovered != null) modelPath = discovered.absolutePath
        }
        if (modelPath.isNullOrBlank()) {
            val err = JSObject().apply {
                put("state", "error")
                put("error", "No model imported — modelPath is required and no .gguf found in app storage")
            }
            call.resolve(err)
            return
        }
        val file = java.io.File(modelPath)
        if (!file.exists() || !file.isFile) {
            val err = JSObject().apply {
                put("state", "error")
                put("error", "Model file not found: $modelPath")
            }
            call.resolve(err)
            return
        }
        LocalLlmService.statusListener = { state, port, error ->
            val data = JSObject().apply {
                put("state", state)
                if (port != null) put("port", port)
                if (error != null) put("error", error)
            }
            notifyListeners("serverStatusChanged", data)
        }
        LocalLlmService.start(ctx, modelPath)
        val snapshot = LocalLlmService.getStatusSnapshot()
        call.resolve(statusToJSObject(snapshot))
    }

    @PluginMethod
    fun stopServer(call: PluginCall) {
        val ctx = context
        if (ctx != null) {
            LocalLlmService.stop(ctx)
        } else {
            try { activity?.let { LocalLlmService.stop(it) } } catch (_: Exception) {}
        }
        val snapshot = LocalLlmService.getStatusSnapshot()
        call.resolve(statusToJSObject(snapshot))
    }

    @PluginMethod
    fun getServerStatus(call: PluginCall) {
        val snapshot = LocalLlmService.getStatusSnapshot()
        call.resolve(statusToJSObject(snapshot))
    }

    // ------------------------------------------------------------------
    // Phase 3: chat — one non-blocking HTTP+SSE round-trip per model turn.
    //
    // TypeScript owns the multi-turn tool-calling loop; this method only POSTs an
    // OpenAI-shaped { messages, tools, stream: true } to the local llama-server,
    // parses the SSE stream, and re-emits normalized events to JS while resolving
    // the call with the fully-assembled assistant message on [DONE].
    // ------------------------------------------------------------------

    @PluginMethod
    fun chatOnce(call: PluginCall) {
        val activity = getActivity()
        if (activity == null) {
            call.reject("Plugin activity is unavailable")
            return
        }
        if (LocalLlmService.state != "ready" || LocalLlmService.port == null) {
            call.reject("Local LLM server is not ready — start it from Settings first")
            return
        }
        val messages = call.getArray("messages")
        if (messages == null) {
            call.reject("messages is required")
            return
        }
        val tools = call.getArray("tools")
        val requestId = call.getString("requestId") ?: ""

        val body = JSObject().apply {
            put("messages", messages)
            if (tools != null) put("tools", tools)
            put("stream", true)
        }

        // Never block the plugin-call (main) thread — a model turn can take minutes.
        Thread({
            try {
                val port = LocalLlmService.port
                    ?: throw IllegalStateException("Server stopped while the request was in flight")
                val conn = URL("http://127.0.0.1:$port/v1/chat/completions")
                    .openConnection() as HttpURLConnection
                try {
                    conn.requestMethod = "POST"
                    conn.setRequestProperty("Content-Type", "application/json")
                    conn.setRequestProperty("Accept", "text/event-stream")
                    conn.connectTimeout = CONNECT_TIMEOUT_MS
                    conn.readTimeout = READ_TIMEOUT_MS
                    conn.doOutput = true
                    val bodyBytes = body.toString().toByteArray(StandardCharsets.UTF_8)
                    conn.setFixedLengthStreamingMode(bodyBytes.size)
                    conn.outputStream.use { out ->
                        out.write(bodyBytes)
                        out.flush()
                    }

                    val code = conn.responseCode
                    if (code !in 200..299) {
                        val errorText = conn.errorStream
                            ?.bufferedReader(StandardCharsets.UTF_8)
                            ?.use { it.readText() }
                            .orEmpty()
                        throw IllegalStateException(
                            "Local LLM request failed ($code)" +
                                if (errorText.isNotBlank()) ": $errorText" else ""
                        )
                    }

                    // OpenAI fragments a single tool call across many chunks KEYED BY
                    // ARRAY POSITION in delta.tool_calls — accumulate by index rather
                    // than replacing, or earlier calls in the same turn are lost.
                    // TreeMap keeps the assembled calls in index order regardless of
                    // the order the fragments arrive in.
                    val toolCallsByIndex = TreeMap<Int, ToolCallAccumulator>()
                    val content = StringBuilder()
                    val startedAt = System.currentTimeMillis()
                    var done = false

                    val reader = BufferedReader(
                        InputStreamReader(conn.inputStream, StandardCharsets.UTF_8)
                    )
                    while (!done) {
                        val line = reader.readLine() ?: break
                        if (!line.startsWith("data:")) continue
                        val payload = line.removePrefix("data:").trim()
                        if (payload.isEmpty()) continue
                        Log.i(TAG, "chatOnce SSE: $payload")
                        if (payload == "[DONE]") {
                            done = true
                            break
                        }
                        val chunk = try {
                            JSONObject(payload)
                        } catch (e: Exception) {
                            Log.w(TAG, "chatOnce: skipping unparsable SSE chunk: ${e.message}")
                            continue
                        }
                        if (chunk.has("error")) {
                            throw IllegalStateException(
                                "Local LLM stream error: ${chunk.opt("error")}"
                            )
                        }
                        val delta = chunk.optJSONArray("choices")?.optJSONObject(0)
                            ?.optJSONObject("delta")
                        if (delta == null) continue

                        val text = delta.optString("content")
                        if (text.isNotEmpty()) {
                            content.append(text)
                            emitChatEvent(activity, requestId) {
                                put("type", "token")
                                put("text", text)
                            }
                        }

                        val toolCalls = delta.optJSONArray("tool_calls") ?: continue
                        for (i in 0 until toolCalls.length()) {
                            val tc = toolCalls.optJSONObject(i) ?: continue
                            val fn = tc.optJSONObject("function")
                            val nameDelta = fn?.optString("name").orEmpty()
                            val argumentsDelta = fn?.optString("arguments").orEmpty()
                            val idDelta = tc.optString("id")

                            val acc = toolCallsByIndex.getOrPut(i) { ToolCallAccumulator() }
                            if (idDelta.isNotEmpty()) acc.id = idDelta
                            if (nameDelta.isNotEmpty()) acc.name.append(nameDelta)
                            if (argumentsDelta.isNotEmpty()) acc.arguments.append(argumentsDelta)

                            // Normalized delta re-emitted to JS — localLlamaCpp.ts
                            // accumulates these same fragments by index as they stream.
                            emitChatEvent(activity, requestId) {
                                put("type", "toolCallDelta")
                                put("index", i)
                                put("name", nameDelta)
                                put("argumentsDelta", argumentsDelta)
                                if (idDelta.isNotEmpty()) put("id", idDelta)
                            }
                        }

                        if (System.currentTimeMillis() - startedAt > STREAM_BUDGET_MS) {
                            throw IllegalStateException(
                                "Local LLM request exceeded the ${STREAM_BUDGET_MS / 1000}s streaming budget"
                            )
                        }
                    }

                    val assembledToolCalls = JSONArray()
                    for ((_, acc) in toolCallsByIndex) {
                        assembledToolCalls.put(
                            JSObject().apply {
                                acc.id?.let { put("id", it) }
                                put("type", "function")
                                put(
                                    "function",
                                    JSObject().apply {
                                        put("name", acc.name.toString())
                                        put("arguments", acc.arguments.toString())
                                    }
                                )
                            }
                        )
                    }

                    val result = JSObject().apply {
                        put("role", "assistant")
                        put("content", content.toString())
                        if (assembledToolCalls.length() > 0) put("tool_calls", assembledToolCalls)
                    }
                    activity.runOnUiThread { call.resolve(result) }
                } finally {
                    conn.disconnect()
                }
            } catch (e: Exception) {
                val message = e.message ?: "Local LLM chat request failed"
                Log.e(TAG, "chatOnce failed", e)
                activity.runOnUiThread { call.reject(message) }
            }
        }, "llm-chat-once").start()
    }

    /** Emits one normalized chatOnceEvent to JS, tagged with the originating
     *  requestId so concurrent turns can filter out events they don't own. */
    private fun emitChatEvent(activity: Activity, requestId: String, fill: JSObject.() -> Unit) {
        activity.runOnUiThread {
            val data = JSObject().apply {
                put("requestId", requestId)
                fill()
            }
            notifyListeners("chatOnceEvent", data)
        }
    }
}
