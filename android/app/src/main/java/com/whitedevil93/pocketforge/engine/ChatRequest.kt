package com.whitedevil93.pocketforge.engine

import com.google.ai.edge.litertlm.Contents
import com.google.ai.edge.litertlm.Message
import com.google.ai.edge.litertlm.OpenApiTool
import com.google.ai.edge.litertlm.RepetitionPenaltyConfig
import com.google.ai.edge.litertlm.SamplerConfig
import com.google.ai.edge.litertlm.ToolProvider
import com.google.ai.edge.litertlm.tool
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
 * @throws IllegalArgumentException if `messages` is missing, empty, or contains
 *   nothing but a system message.
 */
internal fun parseChatRequest(requestBodyJson: String): ChatRequest {
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

    val initialMessages = (startIndex until lastIndex).map { i ->
        toLiteRtMessage(messages.getJSONObject(i))
    }
    val lastMessage = toLiteRtMessage(messages.getJSONObject(lastIndex))

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

private fun toLiteRtMessage(wire: JSONObject): Message {
    val content = wire.optString("content", "")
    return when (wire.optString("role")) {
        "user" -> Message.user(content)
        "assistant" -> Message.model(content)
        "tool" -> Message.tool(Contents.of(content))
        // An unrecognized role degrades to a user turn rather than failing the whole
        // request — the model still sees the text, just without special framing.
        else -> Message.user(content)
    }
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
