package com.whitedevil93.pocketforge

import android.Manifest
import android.app.Activity
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.OpenableColumns
import android.util.Log
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import com.whitedevil93.pocketforge.engine.ModelFormat
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

/** Result of sniffing the header window read at the start of an imported file. */
private sealed class FormatSniffResult {
    data class Recognized(val format: ModelFormat) : FormatSniffResult()
    data class Rejected(val message: String) : FormatSniffResult()
}

/**
 * Native bridge for the on-device inference backends (llama.cpp today, LiteRT-LM
 * planned — see docs/litertlm-android-adapter.md).
 *
 * Phase 0 added the toolchain + a trivial [ping]. Phase 1 adds [pickModelFile],
 * which imports a model (GGUF or .litertlm, sniffed by content — see [ModelFormat])
 * from the SAF document picker into app-private storage. No server/inference logic
 * yet in this file; that lives in LocalLlmService.
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
        private val GGUF_MAGIC = "GGUF".toByteArray(Charsets.US_ASCII)

        /** LiteRT-LM files start with the ASCII magic "LITERTLM" at offset 0, followed
         *  by three little-endian uint32 version fields (major/minor/patch) — see
         *  schema/core/litertlm_read.cc / litertlm_header.h upstream. */
        private val LITERTLM_MAGIC = "LITERTLM".toByteArray(Charsets.US_ASCII)

        /** The only .litertlm major version this app's LiteRT-LM dependency supports.
         *  A mismatch means the file was built for a newer/older format and must be
         *  rejected at import time rather than failing opaquely at engine load. */
        private const val LITERTLM_SUPPORTED_MAJOR = 1

        /** Bytes read up front to sniff the format: 8 for the "LITERTLM" magic plus
         *  12 for its three uint32 version fields — GGUF_MAGIC (4 bytes) fits well within. */
        private const val HEADER_WINDOW_BYTES = 20

        private const val DEFAULT_IMPORT_NAME = "imported-model"

        /** A real model is far larger; anything below this is not a model. */
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
     * select the model file (GGUF or .litertlm). SAF hands back a content:// Uri directly — no storage
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
            call.reject("Selected file is only $totalBytes bytes; expected a model of at least $MIN_MODEL_BYTES bytes")
            return
        }

        val safeName = sanitizeFileName(queryDisplayName(resolver, uri))

        // The copy is a real-time operation for a multi-GB file; never block the
        // plugin-call (main) thread.
        Thread({
            var partial: File? = null
            try {
                val partialFile = File(appContext.filesDir, "$safeName.partial")
                partial = partialFile
                val imported = copyInChunks(resolver, uri, partialFile, totalBytes, activity)
                if (imported.bytesCopied < MIN_MODEL_BYTES) {
                    throw IllegalStateException("Copied file is only ${imported.bytesCopied} bytes; too small to be a valid model")
                }
                // The display name's extension (if any) is trusted for cosmetics only —
                // the sniffed format from the file's own bytes decides the final one, so
                // a mislabeled or extension-less pick still lands with a matching
                // extension for dispatchStart's later auto-discovery.
                val finalName = ensureFormatExtension(safeName, imported.format)
                val destination = File(appContext.filesDir, finalName)
                if (destination.exists()) {
                    destination.delete()
                }
                if (!partialFile.renameTo(destination)) {
                    throw IllegalStateException("Could not finalize the model file in app storage")
                }
                val result = JSObject().apply {
                    put("path", destination.absolutePath)
                    put("name", finalName)
                    put("size", imported.bytesCopied)
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

    private data class ImportedFile(val bytesCopied: Long, val format: ModelFormat)

    /**
     * Streams [uri] into [destination] in fixed-size chunks, sniffing the model
     * format (GGUF or LiteRT-LM) from its own header bytes before writing anything.
     * Emits throttled modelImportProgress events. Never loads the file into memory.
     *
     * @throws IllegalArgumentException if the header doesn't match a recognized format,
     *   or matches LITERTLM at an unsupported major version.
     */
    private fun copyInChunks(
        resolver: ContentResolver,
        uri: Uri,
        destination: File,
        totalBytes: Long?,
        activity: Activity,
    ): ImportedFile {
        val inputStream = resolver.openInputStream(uri)
            ?: throw IllegalStateException("Unable to open the selected file")
        inputStream.use { rawInput ->
            BufferedInputStream(rawInput).use { input ->
                val header = ByteArray(HEADER_WINDOW_BYTES)
                var headerRead = 0
                while (headerRead < header.size) {
                    val read = input.read(header, headerRead, header.size - headerRead)
                    if (read == -1) break
                    headerRead += read
                }
                val sniffed = sniffFormat(header, headerRead)
                val format = when (sniffed) {
                    is FormatSniffResult.Rejected -> throw IllegalArgumentException(sniffed.message)
                    is FormatSniffResult.Recognized -> sniffed.format
                }

                var bytesCopied = headerRead.toLong()
                var lastReportedPercent = -1
                var lastReportedBytes = 0L
                FileOutputStream(destination).use { rawOutput ->
                    BufferedOutputStream(rawOutput).use { output ->
                        output.write(header, 0, headerRead)
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
                return ImportedFile(bytesCopied, format)
            }
        }
    }

    /**
     * Identifies the model format from up to [HEADER_WINDOW_BYTES] header bytes.
     * GGUF is recognized by its 4-byte ASCII magic alone. LITERTLM additionally checks
     * the major-version field when enough bytes were read, so a file built for a
     * future/incompatible format version is rejected here rather than failing opaquely
     * inside the LiteRT-LM engine at load time.
     */
    private fun sniffFormat(header: ByteArray, headerLen: Int): FormatSniffResult {
        if (headerLen >= GGUF_MAGIC.size && header.copyOf(GGUF_MAGIC.size).contentEquals(GGUF_MAGIC)) {
            return FormatSniffResult.Recognized(ModelFormat.GGUF)
        }
        if (headerLen >= LITERTLM_MAGIC.size && header.copyOf(LITERTLM_MAGIC.size).contentEquals(LITERTLM_MAGIC)) {
            val versionFieldsEnd = LITERTLM_MAGIC.size + 12
            if (headerLen >= versionFieldsEnd) {
                val major = readLittleEndianUInt32(header, LITERTLM_MAGIC.size)
                if (major != LITERTLM_SUPPORTED_MAJOR.toLong()) {
                    return FormatSniffResult.Rejected(
                        "This .litertlm file is format version $major.x, but this app only supports " +
                            "format $LITERTLM_SUPPORTED_MAJOR.x — it was likely built by a newer LiteRT-LM"
                    )
                }
            }
            return FormatSniffResult.Recognized(ModelFormat.LITERTLM)
        }
        return FormatSniffResult.Rejected(
            "Not a recognized model file: the file does not start with the 'GGUF' or 'LITERTLM' magic bytes"
        )
    }

    /** Reads a 4-byte little-endian unsigned int (as a Long, to hold the full u32 range)
     *  at [offset] — matches the on-disk layout of the LITERTLM header's version fields. */
    private fun readLittleEndianUInt32(bytes: ByteArray, offset: Int): Long {
        return (bytes[offset].toLong() and 0xFF) or
            ((bytes[offset + 1].toLong() and 0xFF) shl 8) or
            ((bytes[offset + 2].toLong() and 0xFF) shl 16) or
            ((bytes[offset + 3].toLong() and 0xFF) shl 24)
    }

    /** Appends [format]'s extension if [name] doesn't already carry it, first
     *  stripping any other known-format extension so a misdetected pick doesn't
     *  end up as e.g. "model.gguf.litertlm". */
    private fun ensureFormatExtension(name: String, format: ModelFormat): String {
        val wanted = ".${format.extension}"
        if (name.endsWith(wanted, ignoreCase = true)) return name
        val stripped = ModelFormat.entries.fold(name) { acc, other ->
            val suffix = ".${other.extension}"
            if (acc.endsWith(suffix, ignoreCase = true)) acc.dropLast(suffix.length) else acc
        }
        return "$stripped$wanted"
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

    /** [name] is the SAF display name, when the content provider supplied one — not
     *  every provider does, and none of them guarantee an extension that matches the
     *  file's real format, so the blank/generic fallback here carries no extension;
     *  [ensureFormatExtension] adds the correct one once the format is sniffed. */
    private fun sanitizeFileName(name: String?): String {
        val sanitized = name?.replace(Regex("[/\\\\]"), "_")?.trim()
        return if (sanitized.isNullOrBlank()) DEFAULT_IMPORT_NAME else sanitized
    }

    private external fun nativePing(): String

    // ------------------------------------------------------------------
    // Phase 2: server lifecycle — start/stop/status bridged to LocalLlmService.
    // The service owns all state; the plugin only translates PluginCall ↔ Service.
    // Never block the plugin-call thread on model load — startServer returns
    // immediately with state 'loading' and lets serverStatusChanged events /
    // polling convey readiness.
    // ------------------------------------------------------------------

    private fun statusToJSObject(snapshot: Map<String, Any?>): JSObject {
        return JSObject().apply {
            put("state", snapshot["state"] as? String ?: "stopped")
            (snapshot["port"] as? Int)?.let { put("port", it) }
            (snapshot["error"] as? String)?.let { put("error", it) }
            (snapshot["backend"] as? String)?.let { put("backend", it) }
        }
    }

    /** Shared body for both LocalLlmService.statusListener assignments below —
     *  they were identical duplicated closures; kept as one function reference so
     *  the two call sites can't drift out of sync with each other. */
    private fun emitServerStatusChanged(state: String, port: Int?, error: String?, backend: String?) {
        val data = JSObject().apply {
            put("state", state)
            if (port != null) put("port", port)
            if (error != null) put("error", error)
            if (backend != null) put("backend", backend)
        }
        notifyListeners("serverStatusChanged", data)
    }

    /** POST_NOTIFICATIONS permission launcher, registered in [load] via the bridge
     *  so the start continuation fires automatically once the user answers. */
    private var notificationPermissionLauncher: ActivityResultLauncher<Array<String>>? = null

    /** The startServer call awaiting the POST_NOTIFICATIONS dialog result. */
    private var pendingStartServerCall: PluginCall? = null

    override fun load() {
        super.load()
        LocalLlmService.statusListener = ::emitServerStatusChanged
        notificationPermissionLauncher = bridge.registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { permissions -> onNotificationPermissionResult(permissions) }
    }

    @PluginMethod
    fun startServer(call: PluginCall) {
        Log.i(TAG, "startServer: entry modelPath=${call.getString("modelPath")}")
        val ctx = context
        if (ctx == null) {
            Log.e(TAG, "startServer: plugin context unavailable")
            call.reject("Plugin context unavailable")
            return
        }
        if (getActivity() == null) {
            Log.e(TAG, "startServer: plugin activity unavailable")
            call.reject("Plugin activity is unavailable — reopen the app and tap Start again")
            return
        }
        // Android 13+ requires POST_NOTIFICATIONS at runtime. On Android 15+ with
        // targetSdk >= 35, the OS kills a foreground service immediately if its
        // notification can't be shown — so we must have the permission before starting.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                Log.i(TAG, "startServer: POST_NOTIFICATIONS not granted, requesting it")
                if (pendingStartServerCall != null) {
                    Log.w(TAG, "startServer: permission request already in progress")
                    call.reject("Notification permission request already in progress")
                    return
                }
                val launcher = notificationPermissionLauncher
                if (launcher == null) {
                    Log.e(TAG, "startServer: permission launcher unavailable")
                    call.reject("Notification permission launcher is unavailable — restart the app and try again")
                    return
                }
                pendingStartServerCall = call
                try {
                    launcher.launch(arrayOf(Manifest.permission.POST_NOTIFICATIONS))
                } catch (e: Exception) {
                    pendingStartServerCall = null
                    Log.e(TAG, "startServer: permission request launch failed", e)
                    call.reject("Could not request the notification permission: ${e.message}")
                }
                return
            }
            Log.i(TAG, "startServer: POST_NOTIFICATIONS already granted")
        }
        dispatchStart(call, ctx)
    }

    private fun onNotificationPermissionResult(permissions: Map<String, Boolean>) {
        val call = pendingStartServerCall
        pendingStartServerCall = null
        if (call == null) {
            Log.w(TAG, "startServer: permission result with no pending start call")
            return
        }
        if (permissions[Manifest.permission.POST_NOTIFICATIONS] == true) {
            Log.i(TAG, "startServer: POST_NOTIFICATIONS granted, continuing start")
            // Re-read the context rather than reusing startServer()'s: this runs
            // after a trip through the system permission dialog, by which point
            // the plugin may have been detached from its Activity.
            val ctx = context
            if (ctx == null) {
                Log.e(TAG, "startServer: plugin context unavailable after permission grant")
                call.reject("Plugin context unavailable — reopen the app and tap Start again")
                return
            }
            dispatchStart(call, ctx)
        } else {
            Log.w(TAG, "startServer: POST_NOTIFICATIONS denied")
            call.resolve(JSObject().apply {
                put("state", "error")
                put("error", "Notification permission denied — grant it in Android settings and tap Start again")
            })
        }
    }

    private fun dispatchStart(call: PluginCall, ctx: Context) {
        var modelPath = call.getString("modelPath")
        if (modelPath.isNullOrBlank()) {
            val filesDir = ctx.filesDir
            val discovered = filesDir.listFiles()?.firstOrNull { file ->
                ModelFormat.entries.any { file.name.endsWith(".${it.extension}", ignoreCase = true) }
            }
            if (discovered != null) modelPath = discovered.absolutePath
        }
        Log.i(TAG, "startServer: resolved modelPath=$modelPath")
        if (modelPath.isNullOrBlank()) {
            val err = JSObject().apply {
                put("state", "error")
                put("error", "No model imported — modelPath is required and no .gguf or .litertlm found in app storage")
            }
            Log.w(TAG, "startServer: no model available")
            call.resolve(err)
            return
        }
        val file = java.io.File(modelPath)
        if (!file.exists() || !file.isFile) {
            val err = JSObject().apply {
                put("state", "error")
                put("error", "Model file not found: $modelPath")
            }
            Log.w(TAG, "startServer: model file missing: $modelPath")
            call.resolve(err)
            return
        }
        Log.i(TAG, "startServer: dispatching LocalLlmService.start for $modelPath")
        LocalLlmService.statusListener = ::emitServerStatusChanged
        LocalLlmService.start(ctx, modelPath)
        val snapshot = LocalLlmService.getStatusSnapshot()
        Log.i(TAG, "startServer: resolved state=${snapshot["state"]} error=${snapshot["error"]}")
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
        if (LocalLlmService.getStatusSnapshot()["state"] != "ready" || LocalLlmService.port == null) {
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
