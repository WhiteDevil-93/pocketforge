package com.whitedevil93.pocketforge

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.BufferedReader
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.nio.charset.StandardCharsets

/**
 * Streaming callback invoked from nativeGenerate on the HTTP worker thread.
 * Each invocation is written to the client as ONE SSE frame by the service.
 */
interface GenerationCallback {
    fun onToken(piece: String)
    fun onToolCallDelta(index: Int, nameDelta: String, argsDelta: String)
    fun onDone(content: String, toolCallsJson: String)
    fun onError(message: String)
}

class LocalLlmService : Service() {

    companion object {
        private const val TAG = "LocalLlmService"
        const val ACTION_START = "com.whitedevil93.pocketforge.action.START_LLM"
        const val ACTION_STOP = "com.whitedevil93.pocketforge.action.STOP_LLM"
        const val EXTRA_MODEL_PATH = "modelPath"
        const val NOTIFICATION_ID = 1001
        const val CHANNEL_ID = "local_llm_service"
        const val CHANNEL_NAME = "Local LLM"

        @Volatile var state: String = "stopped"
            private set
        @Volatile var port: Int? = null
            private set
        @Volatile var error: String? = null
            private set
        @Volatile var nativeHandle: Long = 0
            private set

        /** True only while a LocalLlmService instance is actually alive (onCreate→onDestroy).
         *  Distinguishes a genuinely running server from a stale companion state left
         *  behind when the OS destroyed the service without killing the process. */
        @Volatile var isServiceRunning: Boolean = false
            private set

        /** True between start() dispatching the FGS intent and the new instance's onCreate. */
        @Volatile var startInFlight: Boolean = false
            private set

        @Volatile private var serviceInstance: LocalLlmService? = null

        /** Single source of truth for "is a model load actually in progress":
         *  the 'loading' state only blocks a restart while the live service
         *  instance still owns an alive load thread. */
        fun isLoadInProgress(): Boolean =
            isServiceRunning && (serviceInstance?.loadThread?.isAlive == true)

        /** Model load is multi-minute on device; this is the generous ceiling before
         *  the watchdog declares the load stuck and hands control back to the UI. */
        private const val LOAD_WATCHDOG_MS = 15 * 60 * 1000L

        private val loadWatchdog = Handler(Looper.getMainLooper())
        private val loadWatchdogRunnable = Runnable {
            if (state != "loading") return@Runnable
            Log.e(TAG, "load watchdog fired after ${LOAD_WATCHDOG_MS / 60000} min")
            val instance = serviceInstance
            if (instance == null || !isServiceRunning) {
                transition("error", null, "The server stopped while loading the model — tap Start to retry")
            } else {
                instance.abortLoad(
                    "Model load timed out after ${LOAD_WATCHDOG_MS / 60000} minutes — tap Start to retry"
                )
            }
        }

        var statusListener: ((String, Int?, String?) -> Unit)? = null

        fun getStatusSnapshot(): Map<String, Any?> {
            // If the service instance is gone, 'ready'/'loading' are stale: report
            // 'stopped' so the UI never shows a server that can no longer be reached.
            val effectiveState =
                if ((state == "ready" || state == "loading") && !isServiceRunning && !startInFlight) {
                    "stopped"
                } else {
                    state
                }
            val m = mutableMapOf<String, Any?>("state" to effectiveState)
            if (effectiveState != "stopped") {
                port?.let { m["port"] = it }
                error?.let { m["error"] = it }
            }
            return m
        }

        fun start(ctx: Context, modelPath: String) {
            if (state == "ready" && isServiceRunning) {
                Log.i(TAG, "already ready with a live service, ignoring start")
                return
            }
            if (state == "loading" && isLoadInProgress()) {
                Log.i(TAG, "already loading with a live load thread, ignoring start")
                return
            }
            if (state == "ready" || state == "loading") {
                Log.w(TAG, "stale $state with no live load, resetting before restart")
                transition("stopped", null, null)
            }
            transition("loading", null, null)
            loadWatchdog.removeCallbacksAndMessages(null)
            loadWatchdog.postDelayed(loadWatchdogRunnable, LOAD_WATCHDOG_MS)
            val intent = Intent(ctx, LocalLlmService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_MODEL_PATH, modelPath)
            }
            startInFlight = true
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    ctx.startForegroundService(intent)
                } else {
                    ctx.startService(intent)
                }
            } catch (e: Exception) {
                // Android 12+ throws ForegroundServiceStartNotAllowedException when the
                // app is not in the foreground; surface it instead of staying 'loading'.
                startInFlight = false
                transition("error", null, "Could not start the LLM server: ${e.message} — keep the app open and tap Start again")
            }
        }

        fun stop(ctx: Context) {
            val intent = Intent(ctx, LocalLlmService::class.java).apply {
                action = ACTION_STOP
            }
            try {
                ctx.startService(intent)
            } catch (e: Exception) {
                Log.w(TAG, "stop: could not deliver to service: ${e.message}")
                if (state != "stopped" && state != "error") transition("stopped", null, null)
            }
        }

        fun transition(newState: String, newPort: Int?, newError: String?) {
            state = newState
            port = newPort
            error = newError
            Log.i(TAG, "state=$newState port=$newPort error=$newError")
            statusListener?.invoke(newState, newPort, newError)
        }
    }

    private var httpSocket: ServerSocket? = null
    private var acceptThread: Thread? = null
    private var loadThread: Thread? = null
    @Volatile private var isStopping = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startInFlight = false
        isServiceRunning = true
        serviceInstance = this
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> handleStart(intent.getStringExtra(EXTRA_MODEL_PATH))
            ACTION_STOP -> handleStop()
            else -> {
                if (state == "stopped" || state == "error") stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        isStopping = true
        stopHttpServer()
        interruptLoad()
        nativeCancel(nativeHandle)
        nativeUnloadModel(nativeHandle)
        nativeFreeModel(nativeHandle)
        nativeHandle = 0
        // Keep an error visible: stopSelf() after a failed load must not erase
        // the reason the server is down.
        if (state != "error") transition("stopped", null, null)
        isServiceRunning = false
        serviceInstance = null
        super.onDestroy()
    }

    private fun handleStart(modelPath: String?) {
        if (state == "ready" && isServiceRunning) {
            Log.i(TAG, "already ready, ignoring start")
            return
        }
        if (state == "loading" && isLoadInProgress()) {
            Log.i(TAG, "already loading, ignoring start")
            return
        }
        if (modelPath.isNullOrBlank()) {
            transition("error", null, "modelPath is required — no model imported")
            stopSelf()
            return
        }
        val file = File(modelPath)
        if (!file.exists() || !file.isFile) {
            transition("error", null, "Model file not found: $modelPath")
            stopSelf()
            return
        }
        if (state != "loading") transition("loading", null, null)
        isStopping = false
        startForegroundWithType()
        loadThread = Thread({
            try {
                val chosenPort = findFreePort()
                Log.i(TAG, "model load starting for $modelPath on port $chosenPort")
                if (isStopping || Thread.currentThread().isInterrupted) {
                    if (state != "error") transition("stopped", null, null)
                    stopSelf()
                    return@Thread
                }
                if (file.length() < 1024 * 1024) {
                    throw IllegalStateException("Model file too small (${file.length()} bytes)")
                }
                val handle = nativeLoadModel(modelPath)
                if (handle == 0L) {
                    throw IllegalStateException("Native model load failed for $modelPath")
                }
                nativeHandle = handle
                if (isStopping || Thread.currentThread().isInterrupted) {
                    nativeUnloadModel(nativeHandle)
                    nativeFreeModel(nativeHandle)
                    nativeHandle = 0
                    if (state != "error") transition("stopped", null, null)
                    stopSelf()
                    return@Thread
                }
                startHttpServer(chosenPort)
                if (isStopping) {
                    stopHttpServer()
                    nativeUnloadModel(nativeHandle)
                    nativeFreeModel(nativeHandle)
                    nativeHandle = 0
                    if (state != "error") transition("stopped", null, null)
                    stopSelf()
                    return@Thread
                }
                transition("ready", chosenPort, null)
                updateNotification()
                Log.i(TAG, "ready on port $chosenPort")
            } catch (e: InterruptedException) {
                Log.i(TAG, "load interrupted")
                nativeUnloadModel(nativeHandle)
                nativeFreeModel(nativeHandle)
                nativeHandle = 0
                if (state != "error") transition("stopped", null, null)
                stopSelf()
            } catch (e: Throwable) {
                Log.e(TAG, "load failed", e)
                nativeUnloadModel(nativeHandle)
                nativeFreeModel(nativeHandle)
                nativeHandle = 0
                stopHttpServer()
                transition("error", null, e.message ?: "Failed to load model")
                updateNotification()
                stopSelf()
            }
        }, "llm-model-load").also { it.start() }
    }

    private fun handleStop() {
        Log.i(TAG, "handleStop state=$state")
        isStopping = true
        interruptLoad()
        stopHttpServer()
        // Abort any in-flight generation: nativeCancel only flips the atomic
        // flag, the decode loop observes it between tokens and exits, then
        // unload/free (which take the same mutex) can proceed safely.
        nativeCancel(nativeHandle)
        nativeUnloadModel(nativeHandle)
        nativeFreeModel(nativeHandle)
        nativeHandle = 0
        transition("stopped", null, null)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun interruptLoad() {
        loadThread?.interrupt()
        loadThread = null
    }

    /** Watchdog path: a load that outlives its generous budget is declared failed,
     *  the load thread is torn down, and the UI gets a retryable 'error' state. */
    private fun abortLoad(message: String) {
        Log.e(TAG, "abortLoad: $message")
        isStopping = true
        interruptLoad()
        stopHttpServer()
        nativeCancel(nativeHandle)
        nativeUnloadModel(nativeHandle)
        nativeFreeModel(nativeHandle)
        nativeHandle = 0
        transition("error", null, message)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun startForegroundWithType() {
        val notification = buildNotification(state, port)
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun updateNotification() {
        try {
            val mgr = getSystemService(NotificationManager::class.java)
            mgr.notify(NOTIFICATION_ID, buildNotification(state, port))
        } catch (_: Exception) {}
    }

    private fun buildNotification(currentState: String, currentPort: Int?): Notification {
        val text = when (currentState) {
            "loading" -> "Loading model…"
            "ready" -> if (currentPort != null) "Ready on 127.0.0.1:$currentPort" else "Ready"
            "error" -> error ?: "Error"
            else -> "Local LLM"
        }
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("PocketForge LLM")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.stat_notify_sync)
            .setOngoing(true)
            .setSilent(true)
            .build()
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val mgr = getSystemService(NotificationManager::class.java)
            if (mgr.getNotificationChannel(CHANNEL_ID) == null) {
                val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_LOW).apply {
                    description = "On-device LLM inference server"
                    setShowBadge(false)
                }
                mgr.createNotificationChannel(channel)
            }
        }
    }

    private fun findFreePort(): Int {
        ServerSocket().use { ss ->
            ss.bind(InetSocketAddress(InetAddress.getByName("127.0.0.1"), 0))
            return ss.localPort
        }
    }

    private fun startHttpServer(port: Int) {
        val ss = ServerSocket()
        ss.reuseAddress = true
        ss.bind(InetSocketAddress(InetAddress.getByName("127.0.0.1"), port))
        httpSocket = ss
        acceptThread = Thread({
            Log.i(TAG, "http server listening on 127.0.0.1:$port")
            while (!isStopping && !Thread.currentThread().isInterrupted) {
                try {
                    val client = ss.accept()
                    Thread({ handleClient(client) }, "llm-http-worker").start()
                } catch (e: Exception) {
                    if (!isStopping) Log.w(TAG, "accept failed: ${e.message}")
                    break
                }
            }
        }, "llm-http-accept").also { it.start() }
    }

    private fun stopHttpServer() {
        isStopping = true
        try { httpSocket?.close() } catch (_: Exception) {}
        httpSocket = null
        acceptThread?.interrupt()
        acceptThread = null
    }

    private fun handleClient(socket: Socket) {
        socket.use { s ->
            try {
                s.soTimeout = 5000
                val reader = BufferedReader(InputStreamReader(s.getInputStream(), StandardCharsets.UTF_8))
                val requestLine = reader.readLine() ?: return
                // PITFALL: the reader buffers ahead, so the request body MUST be
                // read from this same BufferedReader - reading the raw InputStream
                // afterwards would lose the buffered bytes.
                var contentLength = 0
                var line: String?
                while (reader.readLine().also { line = it } != null && line!!.isNotEmpty()) {
                    val header = line!!
                    if (header.startsWith("Content-Length:", ignoreCase = true)) {
                        contentLength = header.substringAfter(':').trim().toIntOrNull() ?: 0
                    }
                }
                val path = requestLine.split(" ").getOrNull(1) ?: "/"
                val out: OutputStream = s.getOutputStream()
                when {
                    path == "/v1/chat/completions" -> handleChatCompletions(reader, contentLength, out)
                    path == "/health" || path == "/v1/health" -> {
                        writeJsonResponse(out, "HTTP/1.1 200 OK", """{"status":"ok"}""")
                    }
                    path == "/" -> {
                        writeJsonResponse(out, "HTTP/1.1 200 OK", """{"status":"ok","service":"PocketForge LLM"}""")
                    }
                    else -> {
                        writeJsonResponse(out, "HTTP/1.1 404 Not Found", """{"error":"not found"}""")
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "handleClient error: ${e.message}")
            }
        }
    }

    private fun writeJsonResponse(out: OutputStream, statusLine: String, body: String) {
        val bodyBytes = body.toByteArray(StandardCharsets.UTF_8)
        val header = "$statusLine\r\nContent-Type: application/json\r\n" +
            "Content-Length: ${bodyBytes.size}\r\nConnection: close\r\n\r\n"
        out.write(header.toByteArray(StandardCharsets.UTF_8))
        out.write(bodyBytes)
        out.flush()
    }

    /**
     * Reads exactly [contentLength] BYTES of request body from [reader].
     * Content-Length counts bytes, not chars: a JSON body with multi-byte UTF-8
     * decodes to fewer chars than bytes, and counting chars instead would block
     * past the end of the body (the client keeps the connection open awaiting
     * the response). Counting encoded bytes lands exactly on the body boundary.
     */
    private fun readRequestBody(reader: BufferedReader, contentLength: Int): String {
        if (contentLength <= 0) return ""
        val raw = ByteArrayOutputStream(contentLength)
        val tmp = CharArray(4096)
        var receivedBytes = 0
        while (receivedBytes < contentLength) {
            val n = reader.read(tmp)
            if (n == -1) break
            val chunk = String(tmp, 0, n).toByteArray(StandardCharsets.UTF_8)
            val take = minOf(chunk.size, contentLength - receivedBytes)
            raw.write(chunk, 0, take)
            receivedBytes += take
            if (take < chunk.size) break
        }
        return raw.toString(StandardCharsets.UTF_8.name())
    }

    private fun handleChatCompletions(reader: BufferedReader, contentLength: Int, out: OutputStream) {
        if (nativeHandle == 0L) {
            writeJsonResponse(out, "HTTP/1.1 500 Internal Server Error", """{"error":"model not loaded"}""")
            return
        }
        val body = readRequestBody(reader, contentLength)
        // Streaming response: no Content-Length; each callback writes one frame.
        val header = "HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\nConnection: close\r\n\r\n"
        out.write(header.toByteArray(StandardCharsets.UTF_8))
        out.flush()

        val callback = object : GenerationCallback {
            override fun onToken(piece: String) {
                if (!writeSse(out, """{"choices":[{"delta":{"content":"${jsonEscape(piece)}"}}]}""")) {
                    nativeCancel(nativeHandle)
                }
            }

            override fun onToolCallDelta(index: Int, nameDelta: String, argsDelta: String) {
                val frame = """{"choices":[{"delta":{"tool_calls":[{"index":$index,""" +
                    """"function":{"name":"${jsonEscape(nameDelta)}","arguments":"${jsonEscape(argsDelta)}"}}]}}]}"""
                if (!writeSse(out, frame)) {
                    nativeCancel(nativeHandle)
                }
            }

            override fun onDone(content: String, toolCallsJson: String) {
                Log.i(TAG, "generation done: content=${content.length} chars, toolCalls=$toolCallsJson")
                writeSse(out, "[DONE]")
                out.flush()
            }

            override fun onError(message: String) {
                Log.e(TAG, "generation error: $message")
                writeSse(out, """{"error":"${jsonEscape(message)}"}""")
                out.flush()
            }
        }
        try {
            nativeGenerate(nativeHandle, body, callback)
        } catch (e: Throwable) {
            // Last-resort guard: never let a JNI escape crash the process.
            Log.e(TAG, "nativeGenerate threw", e)
            try {
                writeSse(out, """{"error":"${jsonEscape(e.message ?: "nativeGenerate failed")}"}""")
            } catch (_: Exception) {}
        }
    }

    /** Writes one SSE frame ("data: <payload>\r\n\r\n") and flushes. Returns
     *  false when the client disconnected (the caller then cancels generation). */
    private fun writeSse(out: OutputStream, payload: String): Boolean {
        return try {
            val frame = "data: $payload\r\n\r\n"
            out.write(frame.toByteArray(StandardCharsets.UTF_8))
            out.flush()
            true
        } catch (e: IOException) {
            Log.w(TAG, "client disconnected: ${e.message}")
            false
        }
    }

    /** JSON-escapes a string for embedding in an SSE data payload. */
    private fun jsonEscape(s: String): String = buildString(s.length + 16) {
        for (c in s) {
            when (c) {
                '"' -> append("\\\"")
                '\\' -> append("\\\\")
                '\n' -> append("\\n")
                '\r' -> append("\\r")
                '\t' -> append("\\t")
                '\b' -> append("\\b")
                '\u000C' -> append("\\f")
                else -> if (c < ' ') append("\\u%04x".format(c.code)) else append(c)
            }
        }
    }

    private external fun nativeLoadModel(path: String): Long
    private external fun nativeUnloadModel(handle: Long)
    private external fun nativeFreeModel(handle: Long)
    private external fun nativeGenerate(handle: Long, requestBodyJson: String, callback: GenerationCallback)
    private external fun nativeCancel(handle: Long)
}
