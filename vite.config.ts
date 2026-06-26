import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Removes _redirects and .assetsignore that Wrangler injects into dist,
// which cause "Infinite loop" errors on Cloudflare Workers deploys.
function removeWranglerFiles() {
  return {
    name: 'remove-wrangler-files',
    closeBundle() {
      ['dist/_redirects', 'dist/.assetsignore'].forEach(f => {
        try { fs.unlinkSync(f); console.log(`Removed: ${f}`) } catch {}
      })
    }
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    removeWranglerFiles(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
