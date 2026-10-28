// Generates every app icon from public/icon.svg. Run `npm run icons` after changing the SVG.
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

const paper = '#EDF1EA'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    // The SVG has its own full-bleed background and keeps the glyph inside the maskable safe zone.
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: paper } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: paper } },
  },
  images: ['public/icon.svg'],
})
