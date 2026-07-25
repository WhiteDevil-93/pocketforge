import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const configuredBasePath = process.env.VITE_BASE_PATH ?? '/pocketforge/'
const basePath = configuredBasePath.endsWith('/') ? configuredBasePath : `${configuredBasePath}/`

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,json,woff2}'],
        navigateFallback: `${basePath}index.html`,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
      manifest: {
        name: 'PocketForge — Teambuilder',
        short_name: 'PocketForge',
        description: 'Competitive Pokémon team builder for Champions Regulation and Showdown formats.',
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/@pkmn/')) {
            return 'pkmn-data';
          }
          if (id.includes('/node_modules/@smogon/calc')) {
            return 'smogon-calc';
          }
        },
      },
    },
  },
});
