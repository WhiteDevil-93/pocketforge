package com.whitedevil93.pocketforge.engine

import android.util.Base64
import com.google.ai.edge.litertlm.Content
import com.google.ai.edge.litertlm.Contents
import com.google.ai.edge.litertlm.Message
import com.google.ai.edge.litertlm.OpenApiTool
import com.google.ai.edge.litertlm.RepetitionPenaltyConfig
import com.google.ai.edge.litertlm.SamplerConfig
import com.google.ai.edge.litertlm.ToolCall
import com.google.ai.edge.litertlm.ToolProvider
import com.google.ai.edge.litertlm.tool
import org.json.JSONArray
import org.json.JSONObject

/**
 * One /v1/chat/completions request, translated into LiteRT-LM's Conversation shape.
 * See docs/litertlm-android-adapter.md §4.2 for the field-by-field mapping and the
 * reasoning behind each choice below.
 */
internal data class ChatRequest(
    val systemInstruction: Contents?,
    val initialMessages: List<Message>,
    val lastMessage: Message,
    val samplerConfig: SamplerConfig?,
    val maxOutputToken: Int?,
    val repetitionPenaltyConfig: RepetitionPenaltyConfig?,
    val tools: List<ToolProvider>,
)

/**
 * Parses the raw OpenAI-shaped request body [InferenceEngine.generate] receives. Only
 * `messages` is required; sampler/penalty/max_tokens fields are all optional today —
 * nothing in this app's TypeScript layer sends them yet — but are parsed here so a
 * future client that does isn't a second Kotlin change.
 *
 * @param visionAvailable whether the loaded engine can accept image content
 *   (docs/litertlm-vl-integration.md §8-9) — an `image_url` part is rejected with a
 *   clear error when false, rather than silently answering as if the image were never
 *   attached.
 * @throws IllegalArgumentException if `messages` is missing, empty, contains nothing
 *   but a system message, or contains an image this engine can't accept.
 */
internal fun parseChatRequest(requestBodyJson: String, visionAvailable: Boolean): ChatRequest {
    val body = JSONObject(requestBodyJson)
    val messages = body.optJSONArray("messages")
        ?: throw IllegalArgumentException("request body has no \"messages\" array")
    if (messages.length() == 0) {
        throw IllegalArgumentException("\"messages\" must not be empty")
    }

    var systemInstruction: Contents? = null
    var startIndex = 0
    if (messages.getJSONObject(0).optString("role") == "system") {
        systemInstruction = Contents.of(messages.getJSONObject(0).optString("content"))
        startIndex = 1
    }

    val lastIndex = messages.length() - 1
    if (lastIndex < startIndex) {
        throw IllegalArgumentException(
            "\"messages\" must contain a message to send after the system prompt"
        )
    }

    // Wire tool messages (localLlamaCpp.ts's own OpenAI-shaped output, which this
    // service's HTTP request body always is regardless of which engine is loaded)
    // carry a tool_call_id, not the tool's name — but LiteRT-LM's Content.ToolResponse
    // needs the name, not an id. Recovering it means walking the same
    // request-tool_calls-then-consume-in-order pairing localLlamaCpp.ts's own
    // toWireMessage uses in reverse: every assistant message's tool_calls[] pushes
    // its call names here, in order, and each following role:"tool" message consumes
    // the next one. Shared across both initialMessages and lastMessage below since a
    // pairing can span that boundary.
    val pendingToolCallNames = ArrayDeque<String>()
    val initialMessages = (startIndex until lastIndex).map { i ->
        toLiteRtMessage(messages.getJSONObject(i), visionAvailable, pendingToolCallNames)
    }
    val lastMessage = toLiteRtMessage(messages.getJSONObject(lastIndex), visionAvailable, pendingToolCallNames)

    return ChatRequest(
        systemInstruction = systemInstruction,
        initialMessages = initialMessages,
        lastMessage = lastMessage,
        samplerConfig = parseSamplerConfig(body),
        // ConversationConfig/sendMessageAsync both require > 0 or null; 0 and negative
        // values (and a missing/non-numeric field, which optInt's default also covers)
        // all collapse to "no override".
        maxOutputToken = body.optInt("max_tokens", -1).takeIf { it > 0 },
        repetitionPenaltyConfig = parseRepetitionPenaltyConfig(body),
        tools = parseTools(body),
    )
}

private fun toLiteRtMessage(
    wire: JSONObject,
    visionAvailable: Boolean,
    pendingToolCallNames: ArrayDeque<String>,
): Message {
    return when (wire.optString("role")) {
        "user" -> Message.user(parseContent(wire.opt("content"), visionAvailable))
        "assistant" -> Message.model(
            parseContent(wire.opt("content"), visionAvailable),
            parseToolCalls(wire.optJSONArray("tool_calls"), pendingToolCallNames),
        )
        "tool" -> {
            // Falls back to a placeholder name only if the id-pairing above ever runs
            // out (malformed history) — never actually expected in practice, since
            // every tool message this app sends follows the assistant message that
            // requested it, one result per call, same as localLlamaCpp.ts assumes.
            val name = pendingToolCallNames.removeFirstOrNull() ?: "unknown_tool"
            Message.tool(Contents.of(Content.ToolResponse(name, wire.optString("content"))))
        }
        // An unrecognized role degrades to a user turn rather than failing the whole
        // request — the model still sees the content, just without special framing.
        else -> Message.user(parseContent(wire.opt("content"), visionAvailable))
    }
}

/** Parses an assistant message's `tool_calls` array (`localLlamaCpp.ts`'s
 *  `{id?, type:'function', function:{name, arguments: <JSON string>}}` shape) into
 *  LiteRT-LM's [ToolCall]s, and records each call's name onto [pendingToolCallNames]
 *  so the `role:"tool"` result(s) that follow can be attributed back to it — see the
 *  call site in [parseChatRequest] for why this needs to be an ordered queue rather
 *  than a lookup by id (LiteRT-LM's ToolCall/ToolResponse API has no id field at all). */
private fun parseToolCalls(array: JSONArray?, pendingToolCallNames: ArrayDeque<String>): List<ToolCall> {
    if (array == null) return emptyList()
    val calls = mutableListOf<ToolCall>()
    for (i in 0 until array.length()) {
        val function = array.optJSONObject(i)?.optJSONObject("function") ?: continue
        val name = function.optString("name")
        if (name.isEmpty()) continue
        val arguments = try {
            jsonObjectToMap(JSONObject(function.optString("arguments", "{}")))
        } catch (e: org.json.JSONException) {
            emptyMap()
        }
        calls.add(ToolCall(name, arguments))
        pendingToolCallNames.addLast(name)
    }
    return calls
}

/** Recursively converts an `org.json` tree into plain Kotlin collections — no
 *  equivalent already exists in this app; LiteRT-LM's own JsonConverters.kt is
 *  internal to its package. */
private fun jsonObjectToMap(obj: JSONObject): Map<String, Any?> {
    val map = mutableMapOf<String, Any?>()
    val keys = obj.keys()
    while (keys.hasNext()) {
        val key = keys.next()
        map[key] = jsonValueToAny(obj.get(key))
    }
    return map
}

private fun jsonValueToAny(value: Any?): Any? = when (value) {
    JSONObject.NULL -> null
    is JSONObject -> jsonObjectToMap(value)
    is JSONArray -> (0 until value.length()).map { jsonValueToAny(value.get(it)) }
    else -> value
}

/** Bytes read from a decoded data: URL above this are rejected rather than sent on —
 *  generous for a real screenshot, tight enough that a malformed or huge payload
 *  fails fast here instead of during base64 decode + JNI marshaling. Downscaling
 *  before the image crosses the bridge (docs/litertlm-vl-integration.md §11, camera
 *  capture) is the primary control; this is a backstop, not the main defense. */
private const val MAX_IMAGE_BYTES = 8 * 1024 * 1024

/**
 * `content` is either a plain string (every existing call site) or an OpenAI content-parts
 * array (docs/litertlm-vl-integration.md's "Image transport" design):
 * `[{"type":"text","text":"…"}, {"type":"image_url","image_url":{"url":"data:…;base64,…"}}]`.
 *
 * @throws IllegalArgumentException if an `image_url` part appears while [visionAvailable]
 *   is false, or an image part's data URL is malformed or exceeds [MAX_IMAGE_BYTES].
 */
private fun parseContent(raw: Any?, visionAvailable: Boolean): Contents {
    return when (raw) {
        null -> Contents.of("")
        is String -> Contents.of(raw)
        is JSONArray -> {
            val parts = mutableListOf<Content>()
            for (i in 0 until raw.length()) {
                val part = raw.optJSONObject(i) ?: continue
                when (part.optString("type")) {
                    "text" -> parts.add(Content.Text(part.optString("text", "")))
                    "image_url" -> {
                        if (!visionAvailable) {
                            throw IllegalArgumentException(
                                "This message includes an image, but the loaded model has no " +
                                    "vision support — import a VL .litertlm bundle to use images"
                            )
                        }
                        val url = part.optJSONObject("image_url")?.optString("url").orEmpty()
                        parts.add(Content.ImageBytes(decodeImageDataUrl(url)))
                    }
                    // An unrecognized part type is skipped rather than failing the whole
                    // request — matches toLiteRtMessage's unrecognized-role behavior.
                    else -> {}
                }
            }
            Contents.of(parts)
        }
        // Anything else (a number, boolean, nested object) is not a shape this app's
        // TypeScript layer ever sends — stringify rather than crash on a client bug.
        else -> Contents.of(raw.toString())
    }
}

/** Decodes a `data:<mime>;base64,<data>` URL into raw bytes. */
private fun decodeImageDataUrl(url: String): ByteArray {
    val commaIndex = url.indexOf(',')
    if (!url.startsWith("data:") || commaIndex == -1) {
        throw IllegalArgumentException("image_url.url must be a data: URL (data:<mime>;base64,<data>)")
    }
    val bytes = try {
        Base64.decode(url.substring(commaIndex + 1), Base64.DEFAULT)
    } catch (e: IllegalArgumentException) {
        throw IllegalArgumentException("image_url.url is not valid base64", e)
    }
    if (bytes.size > MAX_IMAGE_BYTES) {
        throw IllegalArgumentException(
            "Image is ${bytes.size} bytes, exceeding the $MAX_IMAGE_BYTES byte limit — downscale before attaching"
        )
    }
    return bytes
}

/**
 * SamplerConfig's own init validates and throws (topK > 0, topP in 0..1,
 * temperature >= 0) — e.g. llama.cpp's "top_k = 0 means disabled" would crash it.
 * Requiring all three fields present, rather than defaulting the missing ones, avoids
 * silently overriding two knobs the client never mentioned with made-up constants —
 * partial or out-of-range input both fall back to null (the engine's own defaults)
 * rather than a guess or a crash.
 */
private fun parseSamplerConfig(body: JSONObject): SamplerConfig? {
    if (!body.has("temperature") || !body.has("top_p") || !body.has("top_k")) return null
    val topK = body.optInt("top_k")
    val topP = body.optDouble("top_p")
    val temperature = body.optDouble("temperature")
    if (topK <= 0 || topP.isNaN() || topP !in 0.0..1.0 || temperature.isNaN() || temperature < 0.0) {
        return null
    }
    return SamplerConfig(topK = topK, topP = topP, temperature = temperature)
}

/** presence_penalty/frequency_penalty are "OpenAI style" per RepetitionPenaltyConfig's
 *  own KDoc and map directly — unlike repetitionPenalty/windowSize (not sent by this
 *  app today), neither has a validation constraint to worry about. */
private fun parseRepetitionPenaltyConfig(body: JSONObject): RepetitionPenaltyConfig? {
    val presence = optFiniteFloat(body, "presence_penalty")
    val frequency = optFiniteFloat(body, "frequency_penalty")
    if (presence == null && frequency == null) return null
    return RepetitionPenaltyConfig(presencePenalty = presence, frequencyPenalty = frequency)
}

private fun optFiniteFloat(body: JSONObject, key: String): Float? {
    if (!body.has(key)) return null
    val value = body.optDouble(key)
    return if (value.isNaN()) null else value.toFloat()
}

/**
 * Wraps each OpenAI tool declaration (`{"type":"function","function":{name,
 * description, parameters}}`) as a [PassthroughTool]. Every Conversation this app
 * creates sets `automaticToolCalling = false` (see LiteRtLmEngine — PocketForge's
 * tools are TypeScript in the WebView, not Kotlin LiteRT-LM can call itself), so this
 * is a pure declaration hand-off: OpenApiTool.execute() is never reached.
 *
 * A malformed entry (missing "function" or unparsable as JSON) is skipped rather than
 * failing the whole request — the model just won't be offered that one tool.
 * [OpenApiTool.getToolDescriptionJsonString]'s own JSON parsing (inside the LiteRT-LM
 * library) is the real validation gate; a schema that parses here but not there
 * surfaces as a ToolException from Engine.createConversation(), which LiteRtLmEngine
 * catches and reports distinctly from a generation failure.
 */
private fun parseTools(body: JSONObject): List<ToolProvider> {
    val toolsArray = body.optJSONArray("tools") ?: return emptyList()
    return (0 until toolsArray.length()).mapNotNull { i ->
        val function = toolsArray.optJSONObject(i)?.optJSONObject("function") ?: return@mapNotNull null
        tool(PassthroughTool(function.toString()))
    }
}

/** Carries an OpenAI tool declaration through to the model. [execute] is unreachable
 *  because every Conversation this app creates sets `automaticToolCalling = false` —
 *  the call is surfaced to TypeScript via `onToolCallDelta` and executed by the real
 *  handlers in `toolRunner.ts`, which is where the app's actual data lives. */
private class PassthroughTool(private val schemaJson: String) : OpenApiTool {
    override fun getToolDescriptionJsonString(): String = schemaJson

    override fun execute(paramsJsonString: String): String =
        throw IllegalStateException("execute() unreachable with automaticToolCalling = false")
}
