package com.whitedevil93.pocketforge

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.nio.charset.StandardCharsets

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

        var statusListener: ((String, Int?, String?) -> Unit)? = null

        fun getStatusSnapshot(): Map<String, Any?> {
            val m = mutableMapOf<String, Any?>("state" to state)
            port?.let { m["port"] = it }
            error?.let { m["error"] = it }
            return m
        }

        fun start(ctx: Context, modelPath: String) {
            if (state == "ready" || state == "loading") {
                Log.i(TAG, "already $state, ignoring start")
                return
            }
            transition("loading", null, null)
            val intent = Intent(ctx, LocalLlmService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_MODEL_PATH, modelPath)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(intent)
            } else {
                ctx.startService(intent)
            }
        }

        fun stop(ctx: Context) {
            val intent = Intent(ctx, LocalLlmService::class.java).apply {
                action = ACTION_STOP
            }
            ctx.startService(intent)
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
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> handleStart(intent.getStringExtra(EXTRA_MODEL_PATH))
            ACTION_STOP -> handleStop()
            else -> {
                if (state == "stopped") stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        isStopping = true
        stopHttpServer()
        interruptLoad()
        nativeUnloadModel(nativeHandle)
        nativeFreeModel(nativeHandle)
        nativeHandle = 0
        transition("stopped", null, null)
        super.onDestroy()
    }

    private fun handleStart(modelPath: String?) {
        if (state == "ready") {
            Log.i(TAG, "already ready, ignoring start")
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
                    transition("stopped", null, null)
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
                    transition("stopped", null, null)
                    stopSelf()
                    return@Thread
                }
                startHttpServer(chosenPort)
                if (isStopping) {
                    stopHttpServer()
                    nativeUnloadModel(nativeHandle)
                    nativeFreeModel(nativeHandle)
                    nativeHandle = 0
                    transition("stopped", null, null)
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
                transition("stopped", null, null)
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
                var line: String?
                while (reader.readLine().also { line = it } != null && line!!.isNotEmpty()) {}
                val path = requestLine.split(" ").getOrNull(1) ?: "/"
                val body: String
                val statusLine: String
                when {
                    path == "/health" || path == "/v1/health" -> {
                        body = """{"status":"ok"}"""
                        statusLine = "HTTP/1.1 200 OK"
                    }
                    path == "/" -> {
                        body = """{"status":"ok","service":"PocketForge LLM"}"""
                        statusLine = "HTTP/1.1 200 OK"
                    }
                    else -> {
                        body = """{"status":"ok"}"""
                        statusLine = "HTTP/1.1 200 OK"
                    }
                }
                val bodyBytes = body.toByteArray(StandardCharsets.UTF_8)
                val header = "$statusLine\r\nContent-Type: application/json\r\nContent-Length: ${bodyBytes.size}\r\nConnection: close\r\n\r\n"
                val out: OutputStream = s.getOutputStream()
                out.write(header.toByteArray(StandardCharsets.UTF_8))
                out.write(bodyBytes)
                out.flush()
            } catch (_: Exception) {}
        }
    }

    private external fun nativeLoadModel(path: String): Long
    private external fun nativeUnloadModel(handle: Long)
    private external fun nativeFreeModel(handle: Long)
}
