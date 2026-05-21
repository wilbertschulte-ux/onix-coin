import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // иногда помогает
      }
    }
  },
  define: {
    'process.env': {} // на всякий случай
  }
})