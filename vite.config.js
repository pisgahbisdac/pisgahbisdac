import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// Plugin proteksi untuk mencegah kasus file src/indexApp.jsx menjadi 0 byte akibat editor buffer race condition
function safeguardIndexApp() {
  return {
    name: 'safeguard-index-app',
    enforce: 'pre',
    load(id) {
      if (id && id.includes('src/indexApp.jsx') && !id.includes('.bak')) {
        const filePath = resolve(__dirname, 'src/indexApp.jsx');
        const bakPath = resolve(__dirname, 'src/indexApp.jsx.bak');
        try {
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
              console.warn('\n⚠️ [Vite Safeguard] src/indexApp.jsx kosong (0 bytes). Memulihkan dari src/indexApp.jsx.bak...');
              if (fs.existsSync(bakPath) && fs.statSync(bakPath).size > 1000000) {
                fs.copyFileSync(bakPath, filePath);
                return fs.readFileSync(filePath, 'utf-8');
              }
            } else if (stats.size > 1000000) {
              // Otomatis sinkronisasi backup saat berkas normal
              fs.copyFileSync(filePath, bakPath);
            }
          }
        } catch (e) {
          console.error('[Vite Safeguard Error]', e);
        }
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [safeguardIndexApp(), react()],
  build: {
    emptyOutDir: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hadir: resolve(__dirname, 'hadir.html'),
        laporan: resolve(__dirname, 'laporan.html'),
        pembangunan: resolve(__dirname, 'pembangunan.html'),
        inventaris: resolve(__dirname, 'inventaris.html'),
        worshipPresenter: resolve(__dirname, 'worship-presenter.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('html2pdf') || id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf';
            }
          }
        }
      }
    }
  }
})
