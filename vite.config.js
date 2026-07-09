import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hadir: resolve(__dirname, 'hadir.html'),
        laporan: resolve(__dirname, 'laporan.html'),
        pembangunan: resolve(__dirname, 'pembangunan.html')
      }
    }
  }
})
