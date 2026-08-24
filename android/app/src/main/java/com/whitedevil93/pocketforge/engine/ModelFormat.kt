package com.whitedevil93.pocketforge.engine

/**
 * Model container formats this app can import and load.
 *
 * Detected by sniffing the file's own header bytes at import time
 * ([com.whitedevil93.pocketforge.LocalLlmPlugin] `sniffFormat`) — never trusted from a
 * filename extension alone at that point, since SAF content providers do not always
 * supply one. Once imported, the extension is guaranteed to match the sniffed format
 * (`ensureFormatExtension`), so [com.whitedevil93.pocketforge.LocalLlmService] trusts
 * it at load time to pick an [InferenceEngine] without re-reading the file.
 */
enum class ModelFormat(val extension: String) {
    GGUF("gguf"),
    LITERTLM("litertlm"),
}
