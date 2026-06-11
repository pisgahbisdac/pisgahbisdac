# Kerangka & Panduan Proyek Pisgah Bisdac (Vite)

Dokumen ini berisi penjelasan struktur direktori dan arsitektur terbaru setelah proyek berhasil dimigrasikan ke **Vite** dan mendapatkan berbagai pembaruan antarmuka (Responsive UI) serta integrasi backend. Panduan ini berguna sebagai referensi jika ada penambahan fitur atau modifikasi di kemudian hari.

## 📂 Struktur Direktori

```text
pisgahbisdac/
├── node_modules/             # Folder dependensi proyek (otomatis terbuat oleh npm)
├── public/                   # Folder untuk aset statis yang tidak perlu dikompilasi
│   ├── icons/                # Kumpulan ikon SVG dan gambar (logo, dll)
│   ├── manifest.json         # Konfigurasi PWA (Progressive Web App)
│   └── sw.js                 # Service Worker untuk kapabilitas offline/caching
├── src/                      # Folder utama yang berisi kode logika React & JavaScript
│   ├── index.jsx             # Entry point React untuk halaman utama (index.html)
│   ├── indexApp.jsx          # Komponen utama React SPA (Home, Jadwal, AdminDashboard, Warta, dll)
│   ├── hadir.jsx             # Entry point React untuk halaman kehadiran (hadir.html)
│   ├── hadirApp.jsx          # Komponen utama React untuk manajemen kehadiran
│   ├── laporanEntry.js       # Entry point Vanilla JS untuk laporan.html
│   ├── pembangunanEntry.js   # Entry point Vanilla JS untuk pembangunan.html
│   ├── index.css             # Injeksi instruksi inti Tailwind CSS & kelas kustom (Glassmorphism)
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

## ⚙️ Arsitektur & Cara Kerja Sistem Saat Ini

1. **Backend via Google Apps Script (GAS)**
   Seluruh data dinamis (Jadwal, Pejabat, Warta, Buku, Pengumuman, dll) ditarik dan dikirim ke **Google Sheets** menggunakan *Google Apps Script*. Endpoint API didefinisikan secara global (misal: `GAS_API_URL` di dalam `indexApp.jsx`).
   
2. **Caching Lokal & Sinkronisasi Manual**
   Sistem memanfaatkan `localStorage` untuk menyimpan versi terakhir data (caching), memastikan aplikasi dapat dimuat secara instan (di bawah 1 detik). Selain itu, terdapat tombol **Sinkronisasi Manual** melayang (*floating*) berdesain kaca (*glassmorphism*) di sudut kanan bawah. Pengguna dapat menekannya untuk menarik data terbaru secara *real-time* dari Google Sheets tanpa perlu melakukan *refresh* pada browser.
   
3. **Single Page Application (SPA) Routing**
   Khusus pada halaman utama (`index.html` -> `indexApp.jsx`), navigasi aplikasi tidak melakukan *reload* halaman. Tampilan berganti secara dinamis menggunakan *state* `activeTab`. Tab yang tersedia meliputi:
   - `home`: Beranda (Video Hero, Pengumuman, Ikon Pintasan)
   - `admin_dashboard`: Panel Kontrol Admin (Kelola Jadwal, Warta, Pejabat, Buku) dengan proteksi *password*.
   - `warta`, `jadwal`, `belajar`, `live`: Modul-modul tampilan spesifik pengguna.
   - Tombol *Logout Admin* diintegrasikan langsung secara aman di dalam Admin Dashboard.

3. **Desain Responsif & Glassmorphism (Mobile-First)**
   Antarmuka dibangun dengan kelas-kelas *utility* Tailwind yang merespons ukuran layar secara persis:
   - **Mobile** (`default`): Sangat padat, *font* kecil (`text-[9px]`), mencegah *horizontal scroll*.
   - **Tablet / iPad** (`md:`): Padding menengah, menggunakan spasi efisien.
   - **Desktop** (`lg:`): Tampilan melebar (100% *width*), ruang baca sangat lega.
   - **Tema (Light & Dark Mode)**: Modul-modul utama seperti "Selamat Datang" dan "Proyek Gereja" menggunakan efek kaca (*Glassmorphism*) canggih melalui manipulasi warna transparan dan `backdrop-filter: blur()`. Efek ini juga diterapkan pada tombol-tombol melayang (FAB) seperti tombol Sinkronisasi.
   - **Lencana Cerdas (Smart Badges)**: Deteksi tipe file otomatis pada dokumen/buku yang diunggah (misalnya, melabeli file presentasi dengan "✓ PPT", dokumen Word dengan "✓ DOC", atau "✓ PDF").

5. **Kompilasi Cepat dengan Vite**
   Setiap kali ada perubahan pada kode JS atau CSS, *server* Vite langsung menyuntikkannya tanpa memuat ulang penuh browser. Jika kode sudah matang, sistem dikompilasi menjadi bundel aset di dalam `/dist`.

## 🚀 Perintah Operasional

Buka terminal/CMD di dalam folder proyek, lalu gunakan perintah berikut:

### 1. Menjalankan Server Lokal (Untuk Editing)
```bash
npm run dev
```
Vite akan memberikan sebuah URL lokal (misal: `http://localhost:5173`). Setiap kali Anda menekan "Save" pada editor, halaman akan termuat ulang secara instan (*Hot Reloading*).

### 2. Mengkompilasi Aplikasi (Untuk Produksi/Hosting)
```bash
npm run build
```
Perintah ini wajib dijalankan jika Anda sudah selesai mengedit dan siap untuk mempublikasikan web. Vite akan mengecilkan (minify) semua gambar, kodingan JS, dan CSS, lalu meletakkannya di dalam folder `dist/`. **Isi dari folder `dist/` inilah yang akan diunggah ke server hosting.**

### 3. Menguji Hasil Build
```bash
npm run preview
```
Mensimulasikan server hosting lokal terhadap folder `dist/` sebelum Anda mengunggahnya ke internet.

## 📝 Panduan Perbaikan (Troubleshooting)

1. **Ubah Tampilan Beranda/Admin:** Selalu buka `src/indexApp.jsx`. Pastikan mencari komponen fungsional yang tepat (misalnya `<Home />` atau `<AdminDashboard />`).
2. **Efek Warna Tidak Muncul:** Periksa file `src/index.css` atau `tailwind.config.js`. Banyak pengaturan *glassmorphism* tingkat lanjut dan mode gelap disimpan secara terpusat di CSS tersebut.
3. **Konfirmasi Admin / Logout:** Fitur sesi (session) admin disimpan secara sementara di *React State* (`adminToken`, `isAdminLoggedIn`) agar tidak membebani memori lokal (localStorage) tanpa persetujuan, sehingga sangat aman.
