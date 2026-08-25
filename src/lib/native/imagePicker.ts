// ============================================================================
// PocketForge — Image picker/capture native bridge (attach-to-chat images)
// ============================================================================
//
// Thin wrapper over @capacitor/camera's getPhoto(), mirroring localLlm.ts's own
// convention: this module must ONLY be imported dynamically behind an
// isNativeApp() guard (see the use-native-shell.ts convention) so the web/PWA
// bundle never pulls Capacitor camera code in.
//
// getPhoto() + CameraSource.Prompt is @capacitor/camera's DEPRECATED unified
// API — v8 replaced it with separate takePhoto()/chooseFromGallery() calls,
// each with a structured CameraErrorCode. getPhoto() is used here anyway: it
// is still a real, working implementation (delegates to the plugin's
// legacyFlow.getPhoto, not a stub — confirmed by reading the installed
// plugin's own Android source, not assumed from the deprecation notice alone)
// and it is the only way to offer "camera or gallery" from one native prompt
// without this app building its own chooser UI. If a future major version of
// the plugin removes it, the fix is takePhoto()/chooseFromGallery() plus a
// two-button chooser here.
// ============================================================================

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface PickedImage {
  /** Raw base64 (no `data:` prefix) — pair with [format] to build the data URL
   *  ChatMessage's ContentPart.image_url.url expects. */
  base64: string;
  /** e.g. "jpeg" — Android and iOS only ever produce jpeg for this call. */
  format: string;
}

/**
 * The user declined the permission prompt or cancelled the camera/gallery
 * picker. A normal outcome, not a failure — callers should treat it as
 * "nothing picked" (no error toast), matching how the equivalent case is
 * handled on the Kotlin side (docs/litertlm-vl-integration.md).
 */
export class ImagePickCancelledError extends Error {
  constructor() {
    super('Image pick cancelled or permission denied');
    this.name = 'ImagePickCancelledError';
  }
}

// getPhoto()'s legacy flow rejects with a plain string, not a structured error
// code (CameraErrorCode only exists on the new takePhoto()/chooseFromGallery()
// API) — confirmed from the plugin's LegacyCameraFlow source, which rejects
// permission denial and user cancellation with fixed English strings
// ("User denied access to camera", "User cancelled photos app"). Matching
// broadly on these words, not the exact strings, is the durable version of
// that same check: it survives a future patch rewording the message without
// changing its meaning, at the cost of (harmlessly) also catching a genuine
// failure whose message happens to contain one of these words.
const CANCEL_OR_DENIED_PATTERN = /cancel|denied|permission/i;

/**
 * Opens the native chooser (camera or gallery) and returns the picked image
 * as base64. Downscales natively via width/height/quality so a 12 MP photo
 * never becomes a multi-MB base64 string in the WebView — Gemma 4's vision
 * tower works at a fixed input resolution, so oversending buys nothing
 * (docs/litertlm-vl-integration.md's "Image transport" design). These bounds
 * are generous relative to the Kotlin-side 8 MiB decoded cap
 * (engine/ChatRequest.kt's MAX_IMAGE_BYTES) — that cap is the backstop, this
 * is the primary control.
 *
 * @throws ImagePickCancelledError if the user cancelled or denied permission.
 */
export async function pickOrCaptureImage(): Promise<PickedImage> {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
      quality: 85,
      width: 1024,
      height: 1024,
      correctOrientation: true,
      // Never write back to the device's gallery — this app only needs the
      // bytes for one chat turn, and skipping this avoids the extra storage
      // permission the plugin would otherwise request on Android 9 and below.
      saveToGallery: false,
    });
    if (!photo.base64String) {
      throw new Error('Camera returned no image data');
    }
    return { base64: photo.base64String, format: photo.format };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (CANCEL_OR_DENIED_PATTERN.test(message)) {
      throw new ImagePickCancelledError();
    }
    throw error;
  }
}

/** Builds a `data:image/<format>;base64,<data>` URL from a [PickedImage] —
 *  the exact shape ContentPart.image_url.url expects. */
export function toDataUrl(image: PickedImage): string {
  return `data:image/${image.format};base64,${image.base64}`;
}
