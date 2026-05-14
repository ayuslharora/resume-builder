import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { buildHomepageStaticHtml } from './src/seo/homepageSeoContent.js'
import {
  APP_SHELL_SEO,
  AUTH_STATIC_ROUTES,
  NOT_FOUND_SEO,
  PUBLIC_STATIC_ROUTES,
  buildAppShellHtml,
  buildStaticRouteHtml,
} from './src/seo/staticRouteHtml.js'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))

function homepageSeoShellPlugin() {
  return {
    name: 'homepage-seo-shell',
    transformIndexHtml(html) {
      return html.replace('<!-- HOMEPAGE_SEO_SHELL -->', buildHomepageStaticHtml())
    },
    async writeBundle(options) {
      const outDir = options.dir ?? 'dist'
      const indexPath = path.resolve(outDir, 'index.html')
      const html = await readFile(indexPath, 'utf8')

      await Promise.all([
        ...PUBLIC_STATIC_ROUTES.map((route) =>
          writeFile(path.resolve(outDir, route.fileName), buildStaticRouteHtml(html, route)),
        ),
        ...AUTH_STATIC_ROUTES.map((route) =>
          writeFile(path.resolve(outDir, route.fileName), buildAppShellHtml(html, route)),
        ),
        writeFile(path.resolve(outDir, 'app.html'), buildAppShellHtml(html, APP_SHELL_SEO)),
        writeFile(path.resolve(outDir, '404.html'), buildAppShellHtml(html, NOT_FOUND_SEO)),
      ])
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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    modulePreload: {
      resolveDependencies(filename, deps, { hostType }) {
        if (hostType !== 'html') {
          return deps
        }

        return deps.filter((dep) => !dep.includes('firebase-'))
      },
    },
  },
}))
