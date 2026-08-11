package com.whitedevil93.pocketforge

import android.app.Activity
import android.content.ContentResolver
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import androidx.activity.result.ActivityResult
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileOutputStream
import kotlin.math.roundToInt

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

        /** Must match the [ActivityCallback]-annotated method name. */
        private const val PICK_MODEL_CALLBACK = "onPickModelResult"

        /** GGUF files start with the ASCII magic "GGUF" at offset 0. */
        private const val GGUF_MAGIC = "GGUF"

        /** A real GGUF model is far larger; anything below this is not a model. */
        private const val MIN_MODEL_BYTES = 1024L * 1024L

        /** 256 KiB streaming buffer — never buffer the whole (multi-GB) file. */
        private const val COPY_BUFFER_SIZE = 256 * 1024
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
}
