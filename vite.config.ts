import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const defaultBasePath = mode === 'development' ? '/' : '/pocketforge/'
  const configuredBasePath = process.env.VITE_BASE_PATH ?? defaultBasePath
  const basePath = configuredBasePath.endsWith('/') ? configuredBasePath : `${configuredBasePath}/`

  return {
    base: basePath,
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0'),
      __APP_COMMIT__: JSON.stringify(process.env.VITE_APP_COMMIT ?? 'local'),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          globPatterns: ['**/*.{js,css,html,ico,svg,json,woff2}'],
          navigateFallback: `${basePath}index.html`,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        },
        manifest: {
          id: basePath,
          name: 'PocketForge — Teambuilder',
          short_name: 'PocketForge',
          description: 'Competitive Pokémon team builder for Champions Regulation M-B and Showdown formats.',
          theme_color: '#0B1120',
          background_color: '#0B1120',
          display: 'standalone',
          orientation: 'portrait',
          start_url: basePath,
          scope: basePath,
          categories: ['games', 'utilities'],
          icons: [
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          onlyExplicitManualChunks: true,
          manualChunks(id) {
            if (id.includes('/node_modules/@pkmn/sets/')) {
              return 'pkmn-sets';
            }
            if (
              id.includes('/node_modules/@pkmn/dex/') ||
              id.includes('/node_modules/@pkmn/data/')
            ) {
              return 'pkmn-engine';
            }
            if (id.includes('/node_modules/@smogon/calc')) {
              return 'smogon-calc';
            }
          },
        },
      },
    },
  };
});
