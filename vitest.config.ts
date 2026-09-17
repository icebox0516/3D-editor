import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// 独立于 vite.config.ts：vitest.config.ts 存在时优先使用本文件
export default defineConfig({
  plugins: [react()],
  test: {
    passWithNoTests: true,
    include: ['tests/**/*.test.{ts,tsx,mjs}', 'src/**/*.test.{ts,tsx}'],
  },
})
