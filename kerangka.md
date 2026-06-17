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
├── laporan.html              # Halaman manajemen laporan & keuangan (Sistem Role, Approval, dll)
├── pembangunan.html          # Halaman laporan pembangunan
├── package.json              # Daftar library & script npm (Vite, React, Tailwind)
├── tailwind.config.js        # Konfigurasi tema warna & desain Tailwind CSS
├── postcss.config.js         # Konfigurasi engine proses CSS
└── vite.config.js            # Pengaturan Vite (konfigurasi Multi-Page Application)
```

## ⚙️ Arsitektur & Cara Kerja Sistem Saat Ini

### 1. Backend via Google Apps Script (GAS)
Seluruh data dinamis (Keuangan, Jadwal, Pejabat, Warta, Buku, dll) ditarik dan dikirim ke **Google Sheets** menggunakan *Google Apps Script*. Endpoint API didefinisikan secara global. Pada sistem Laporan, setiap transaksi memiliki ID dan jejak log audit.

### 2. Caching Lokal & Sinkronisasi Manual
Sistem memanfaatkan `localStorage` dan `sessionStorage` untuk menyimpan versi terakhir data (caching), memastikan aplikasi dapat dimuat secara instan (di bawah 1 detik). Terdapat sistem auto-sync maupun tombol **Sinkronisasi Manual** untuk menarik pembaruan data secara langsung.

### 3. Role-Based Access Control (RBAC) pada Laporan Keuangan
Aplikasi `laporan.html` menerapkan sistem hak akses ketat yang dikonfigurasi melalui menu Master Data > Akun:
- **Admin:** Memiliki kontrol penuh atas semua fitur, pengaturan sistem, konfigurasi kategori, dan penghapusan permanen.
- **Bendahara:** Dapat menginput, mengedit, dan menghapus transaksi pemasukan/pengeluaran serta menarik laporan.
- **Ketua Jemaat & Pendeta:** Berperan sebagai otorisator (*Approver*). Memiliki akses baca penuh ke riwayat transaksi dan dapat melakukan "Approve" atas transaksi yang dimasukkan oleh Bendahara.
- **Viewer / Publik:** Akses baca (*read-only*) secara terbatas.

### 4. Alur Persetujuan (Approval Workflow)
Setiap transaksi yang masuk akan berstatus **Pending**. Ketua Jemaat atau Pendeta wajib menekan tombol **Approve**. 
Jika salah satu menyetujui, status berubah menjadi **1/2 Acc**. Jika keduanya menyetujui, status menjadi **Disetujui penuh (✅)**. 
**Penting:** Transaksi yang telah disetujui penuh **dikunci (ter-lock)**, sehingga nominal dan data pihak terkait tidak dapat dimodifikasi (baik dari sisi antarmuka maupun backend), kecuali hanya untuk penambahan/perubahan bukti foto.

### 5. Multi-Upload Foto Kuitansi dengan Kompresi
Aplikasi mengizinkan pengunggahan hingga **3 foto bukti** per transaksi. Sebelum dikirim ke *server*, gambar diproses secara lokal (*client-side*) menggunakan HTML5 Canvas untuk **kompresi otomatis** guna mengurangi beban pengiriman tanpa menghilangkan kejelasan teks pada kuitansi.

### 6. Desain Responsif & Glassmorphism (Mobile-First)
Antarmuka dibangun dengan kelas *utility* Tailwind yang responsif:
- **Mobile** (`default`): Optimal untuk layar kecil, meminimalisir tombol besar.
- **Desktop** (`lg:`): Memanfaatkan *grid* tabel untuk tampilan analitik.
- **Tema (Light & Dark Mode)**: Dapat di-toggle, didukung oleh skema warna tingkat lanjut (CSS Variables).

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
Perintah ini wajib dijalankan jika Anda sudah selesai mengedit dan siap untuk mempublikasikan web. Vite akan mengecilkan (minify) semua aset JS, dan CSS, lalu meletakkannya di dalam folder `dist/`. **Isi dari folder `dist/` inilah yang akan diunggah ke server hosting.**

### 3. Menguji Hasil Build
```bash
npm run preview
```
Mensimulasikan server hosting lokal terhadap folder `dist/` sebelum Anda mengunggahnya ke internet.

## 📝 Panduan Perbaikan (Troubleshooting)

1. **Sinkronisasi Kode Apps Script:** Jika Anda mengubah logika persetujuan (approval) atau validasi kolom, jangan lupa memperbarui atau melakukan *New Deployment* pada skrip GAS di Google Cloud, bukan hanya mengeditnya secara lokal.
2. **Kendala Upload Foto Bersamaan:** Jika upload foto *error* format, sistem sudah dilengkapi `Promise` berurutan pada `handleReceiptPhoto()`. Pastikan peramban tidak memblokir FileReader.
3. **Konfirmasi Hak Akses:** Sistem login menyimpan token pada `sessionStorage`. Jika Anda membuat role baru, pastikan role tersebut didefinisikan secara _hardcode_ (atau _dynamic config_) pada fungsi `getRolePerms()` di berkas JavaScript klien.
