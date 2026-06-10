# PISGAH BISDAC APP-WEBSITE
Sebuah project web apps untuk memberikan informasi yang berhubungan dengan:
 - JADWAL PEMBAWA ACARA
 - WARTA GEREJA
 - UPDATE VIDEO TERBARU
 - UPDATE INFORMASI
 - BUKU ROH NUBUAT
 - KEHADIRAN KHOTBAH DAN SEKOLAH SABAT
 - 10 POIN KETERLIBATAN ANGGOTA KELAS
 - LAPORAN KEUANGAN JEMAAT
DLL

Serta informasi dan artikel lain-nya yang bisa membangun inam dan kerohanian
pengunjung untuk lebih dekat dengan Tuhan.

Struktur yang digunakan dalam App Repo ini adalah :

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