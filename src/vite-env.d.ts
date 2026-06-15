/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_AI_API_URL?: string;
  readonly VITE_AI_COACH_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}