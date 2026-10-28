import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { teasersPlugin } from './build/teasersPlugin'

// Screenshot runs point this at test fixtures (TEASERS_DIR=tests/fixtures/...); the real app uses teasers/.
const teasersDir = path.resolve(process.env.TEASERS_DIR ?? 'teasers')

// Page background in light mode. Keep in sync with --paper in src/styles.css and the theme-color metas.
const paper = '#EDF1EA'

export default defineConfig({
  // Relative paths + hash routing, so the app works under the GitHub Pages sub-path.
  base: './',
  resolve: {
    alias: { '@teasers': teasersDir },
  },
  plugins: [
    teasersPlugin(teasersDir),
    react(),
    VitePWA({
      // Updates: see src/updates.ts and CLAUDE.md. Never switch to 'prompt' or anything that makes a worker wait.
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: './',
        name: 'Brain Teasers',
        short_name: 'Teasers',
        description: 'Daily brain teasers for Aramayis and Armen, with a running score.',
        lang: 'en',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: paper,
        theme_color: paper,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // injectRegister: false stops the plugin from setting these two, so they are set here explicitly.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        // Precache everything the app needs offline. KaTeX also ships .woff/.ttf copies that iOS never uses,
        // and Literata subsets for scripts we don't write in.
        globPatterns: ['**/*.{html,js,css,svg,png,ico,woff2}'],
        globIgnores: ['**/literata-cyrillic*', '**/literata-vietnamese*', '**/literata-greek-ext*'],
      },
    }),
  ],
})
