import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildHomepageStaticHtml } from './src/seo/homepageSeoContent.js'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))

function homepageSeoShellPlugin() {
  return {
    name: 'homepage-seo-shell',
    transformIndexHtml(html) {
      return html.replace('<!-- HOMEPAGE_SEO_SHELL -->', buildHomepageStaticHtml())
    },
  }
}

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), homepageSeoShellPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(srcPath),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
}))
