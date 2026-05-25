import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/grein-type/',
  plugins: [react()],
  server: {
    host: true, // ネットワーク上の他のデバイスからアクセス可能にする
  }
})
