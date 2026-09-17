import { cpSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// 生产构建把 assets/（manifest + models + thumbnails + mappings）拷入 dist/assets/：
// dev 由 vite 直接 serve 项目根故资产可达；preview 只服务 dist，不拷贝则
// fetch('assets/manifest.json') 命中 SPA fallback 返回 HTML，清单解析失败。
function copyStaticAssets(): Plugin {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const root = process.cwd()
      const src = resolve(root, 'assets')
      if (existsSync(src)) cpSync(src, resolve(root, 'dist/assets'), { recursive: true })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyStaticAssets()],
})
