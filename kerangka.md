# Kerangka & Panduan Proyek Pisgah Bisdac (Vite)

Dokumen ini berisi penjelasan struktur direktori terbaru setelah proyek berhasil dimigrasikan dari React (Babel CDN) & Tailwind CDN ke **Vite**. Panduan ini berguna sebagai referensi jika ada penambahan fitur atau modifikasi di kemudian hari.

## 📂 Struktur Direktori

```text
pisgahbisdac/
├── node_modules/             # Folder dependensi proyek (otomatis terbuat oleh npm)
├── public/                   # Folder untuk aset statis yang tidak perlu dikompilasi
│   ├── icons/                # Kumpulan ikon SVG dan gambar
│   ├── manifest.json         # Konfigurasi PWA (Progressive Web App)
│   └── sw.js                 # Service Worker untuk kapabilitas offline/caching
├── src/                      # Folder utama yang berisi kode logika React & JavaScript
│   ├── index.jsx             # Entry point React untuk halaman utama (index.html)
│   ├── indexApp.jsx          # Komponen utama React untuk index.html
│   ├── hadir.jsx             # Entry point React untuk halaman kehadiran (hadir.html)
│   ├── hadirApp.jsx          # Komponen utama React untuk hadir.html
│   ├── laporanEntry.js       # Entry point Vanilla JS untuk laporan.html
│   ├── pembangunanEntry.js   # Entry point Vanilla JS untuk pembangunan.html
│   ├── index.css             # Injeksi instruksi inti Tailwind CSS
│   ├── stylemain.css         # Styling kustom tambahan untuk index.html
│   ├── stylehadir.css        # Styling kustom tambahan untuk hadir.html
│   └── stylelaporan.css      # Styling kustom tambahan untuk laporan.html
├── dist/                     # Folder HASIL KOMPILASI (Production-ready). Digunakan saat hosting.
├── index.html                # Halaman utama (berhubungan dengan src/index.jsx)
├── hadir.html                # Halaman kehadiran (berhubungan dengan src/hadir.jsx)
├── laporan.html              # Halaman laporan (berhubungan dengan src/laporanEntry.js)
├── pembangunan.html          # Halaman pembangunan (berhubungan dengan src/pembangunanEntry.js)
├── package.json              # Daftar library & script npm (Vite, React, Tailwind)
├── tailwind.config.js        # Konfigurasi tema warna & desain Tailwind CSS
├── postcss.config.js         # Konfigurasi engine proses CSS
└── vite.config.js            # Pengaturan Vite (konfigurasi Multi-Page Application)
```

## ⚙️ Cara Kerja Aplikasi (Alur Kerja Baru)

1. **Pengembangan (Development)**
   Aplikasi tidak lagi diproses secara langsung oleh browser web, melainkan oleh Node.js. 
   Kode React (file `.jsx`) dan Vanilla JS (`.js`) terhubung ke file `.html` melalui tag `<script type="module">`.

2. **Styling**
   Tailwind tidak lagi dipanggil melalui URL (`cdn.tailwindcss.com`). Sebagai gantinya, Vite dan PostCSS akan memindai seluruh file `.html` dan `.jsx` Anda, lalu secara otomatis membuatkan satu file CSS rapi yang berisi kode CSS final tanpa memberatkan browser.

3. **Multi-Page Application (MPA)**
   Aplikasi Anda memiliki lebih dari 1 halaman (index, hadir, laporan, pembangunan). Semuanya telah didaftarkan di dalam file `vite.config.js`. Vite secara otomatis akan membangun seluruh rute ini.

## 🚀 Perintah Operasional

Buka terminal/CMD di dalam folder proyek, lalu gunakan perintah berikut:

### 1. Menjalankan Server Lokal (Untuk Editing)
```bash
npm run dev
```
Gunakan perintah ini ketika Anda ingin mengedit atau menambahkan kode. Vite akan memberikan sebuah URL lokal (misal: `http://localhost:5173`). Setiap kali Anda menekan "Save" pada editor, halaman akan termuat ulang secara instan (*Hot Reloading*).

### 2. Mengkompilasi Aplikasi (Untuk Produksi/Hosting)
```bash
npm run build
```
Perintah ini wajib dijalankan jika Anda sudah selesai mengedit dan siap untuk mempublikasikan web.
Perintah ini akan mengecilkan (minify) semua gambar, kodingan JS, dan CSS, lalu meletakkannya di dalam folder `dist/`. **Isi dari folder `dist/` inilah yang akan diunggah ke server hosting (seperti Vercel, GitHub Pages, Netlify, atau cPanel).**

### 3. Menguji Hasil Build
```bash
npm run preview
```
Gunakan perintah ini untuk mensimulasikan server hosting lokal terhadap folder `dist/` sebelum Anda mengunggahnya ke internet secara nyata.

## 📝 Tips Tambahan Saat Memodifikasi

1. **Mengedit Komponen React**
   Jika ingin mengubah tampilan beranda, Anda kini harus membuka `src/indexApp.jsx`, bukan lagi `index.html`. 
2. **Mengubah Tema Warna**
   Tema warna (`gold`, `navy`, `obsidian`) sekarang berada terpusat di `tailwind.config.js`. Mengubah warna di sana akan berdampak ke seluruh komponen web.
3. **Menginstall Library Baru**
   Anda tidak perlu lagi menggunakan `<script src="...">` dari unpkg atau cdnjs. Cukup gunakan `npm install nama-library`, lalu di-import di file `.jsx` (misal: `import axios from 'axios';`).
