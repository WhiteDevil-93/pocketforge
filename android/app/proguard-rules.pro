# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# --- LocalLlm engine seam (docs/litertlm-android-adapter.md) --------------
#
# Dormant while minifyEnabled is false for release (see app/build.gradle) — kept
# here so shrinking/obfuscation can be turned on later without silently breaking
# the native bridge. GenerationCallback is invoked by JNI (pokekit-llm.cpp does
# env->GetObjectClass(callback) + GetMethodID by name/signature — see
# LocalLlmService.kt), so its method names and signatures must survive R8 intact.
-keep interface com.whitedevil93.pocketforge.GenerationCallback { *; }

# InferenceEngine implementations (LlamaCppEngine today, LiteRtLmEngine once
# docs/litertlm-android-adapter.md step 4 lands) declare `external fun`s that JNI
# resolves by class + method name; R8 must not rename or strip them.
-keep class com.whitedevil93.pocketforge.engine.** { *; }

# TODO(step 6, tool calls): once an OpenApiTool subclass is added for manual
# LiteRT-LM tool calling, keep it too — its getToolDescriptionJsonString()/
# execute() overrides are called by the LiteRT-LM library via the ToolProvider
# interface, not referenced directly from this app's own call sites.
