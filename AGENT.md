# AGENT.md — Panduan Arsitektur & Aturan Kerja Proyek PISGAH-BISDAC

> **Catatan**: Berkas ini disiapkan bersama dengan [`AGENTS.md`](./AGENTS.md) agar dapat dikenali secara otomatis oleh berbagai AI Coding Agent (termasuk Antigravity yang secara otomatis memuat `AGENTS.md`).

Dokumen ini adalah sumber kebenaran utama (*single source of truth*) bagi AI Agent yang bekerja di dalam repositori `/home/sagala/pisgahbisdac/pisgahbisdac`. Bacalah dokumen ini dengan saksama sebelum melakukan analisis, penambahan fitur, atau perbaikan *bug* agar tidak salah memahami struktur proyek.

---

## 1. Identitas & Batas Proyek (*Project Scope Boundary*)

- **Nama Proyek**: **PISGAH-BISDAC App-Website**
- **Organisasi**: Gereja Masehi Advent Hari Ketujuh (GMAHK) Jemaat Pisgah / *Batam International Seventh-day Adventist Church (BISDAC)*.
- **Fungsi Utama**: Aplikasi web progresif (*Progressive Web App* / PWA) berkonsep *Multi-Page Application (MPA)* untuk informasi peribadatan, warta jemaat, pustaka rohani (Alkitab 66 Kitab, 525 Lagu Sion, Buku Roh Nubuat, Pelajaran Sekolah Sabat Harian), pencatatan kehadiran & Sekolah Sabat, laporan keuangan/perbendaharaan jemaat, donasi pembangunan, dan manajemen inventaris aset gereja.
- **PERINGATAN BATAS DIREKTORI**:
  - Fokus kerja proyek ini adalah di dalam `/home/sagala/pisgahbisdac/pisgahbisdac`.
  - **JANGAN TERTUKAR** dengan folder saudara `/home/sagala/pisgahbisdac/PB/` yang berisi spesifikasi proyek terpisah bernama *WorshipPresenter*.
  - File `worship-presenter.html` yang ada di dalam repositori ini hanyalah halaman panduan pengguna statis dan halaman unduhan untuk aplikasi desktop *Worship Presenter*, **bukan** kode aplikasi *WorshipPresenter* itu sendiri.

---

## 2. Peringatan Penting: Perbedaan `README.md` Lama vs Kode Aktif

File `README.md` di root proyek memuat dokumentasi struktur awal yang **sebagian sudah usang (*outdated*)**. Jangan terpaku pada `README.md` untuk lokasi file berikut:

| Hal yang Sering Disalahpahami | Fakta Sebenarnya di Codebase Saat Ini |
| :--- | :--- |
| `src/laporanEntry.js` dianggap kode utama `laporan.html` | **SALAH.** `src/laporanEntry.js` hanya berisi 2 baris stub (`import './index.css'`). Seluruh logika aktif `laporan.html` berada di **`src/laporan/main.js`**, **`src/laporan/supabaseAdapter.js`**, dan **`src/laporan/modules/*`**. |
| `src/pembangunanEntry.js` dianggap kode utama `pembangunan.html` | **SALAH.** `src/pembangunanEntry.js` hanya berisi 2 baris stub. Seluruh HTML dan JavaScript aktif untuk halaman pembangunan berada **langsung (*inline*) di dalam `pembangunan.html`**. |
| `src/stylemain.css`, `src/stylehadir.css`, `src/stylelaporan.css` dianggap masih dipakai oleh HTML | **SALAH.** Ketiga file CSS tersebut sudah digabung ke dalam **`src/index.css`** (serta **`src/laporan/styles.css`** khusus untuk `laporan.html`). |
| Proyek dianggap hanya menggunakan Google Apps Script (GAS) | **SALAH.** Proyek telah bermigrasi ke arsitektur **Hybrid / Dual-Database**: **Supabase** (`https://lxapdcjquipdowscfgtq.supabase.co`) sebagai database utama berkecepatan tinggi pada modul Kehadiran, Keuangan/Laporan, dan Inventaris, dengan **Google Apps Script (Google Sheets)** sebagai *fallback* / *dual-backup*. |

---

## 3. Arsitektur Multi-Page Application (6 Entry Points di `vite.config.js`)

Proyek ini di-build menggunakan **Vite 5** sebagai Multi-Page Application (MPA) dengan 6 input HTML di `vite.config.js`:

### 3.1. Portal Utama Jemaat (`index.html`)
- **Alur File**: `index.html` → `src/index.jsx` → `src/indexApp.jsx` (+ `src/DetailSekolahSabat.jsx`)
- **Framework**: React 19 + Tailwind CSS (`src/index.css`) + `lucide-react`
- **Fitur Utama**:
  - Beranda, Jadwal Pembawa Acara, Susunan Ibadah, Warta Gereja & Buletin Sabat, Live/Video Terbaru.
  - **Alkitab Digital 66 Kitab** (membaca JSON statis offline dari `public/alkitab/1.json` s/d `66.json`).
  - **Lagu Sion (525 Lagu)** (membaca JSON statis offline dari `public/lagu_sion.json` dengan pemutar audio/musik & lirik).
  - **Pelajaran Sekolah Sabat Harian** (`src/DetailSekolahSabat.jsx`): bacaan 7 hari, popup ayat Alkitab interaktif, highlight warna ayat, catatan & refleksi harian jemaat yang tersinkronisasi 2 arah dengan Alkitab Digital.
  - **Pustaka Digital / Buku Roh Nubuat (EGW)** dengan sampul SVG dinamis (`getSvgBookCover`).
  - Informasi Persembahan / Kalkulator Perpuluhan, pintasan Cek Transaksi (mengarahkan ke `laporan.html`), dan Dashboard Admin.
- **Backend**: Google Apps Script (`GAS_API_URL` di `src/indexApp.jsx`) + caching lokal (`localStorage` & Service Worker).

### 3.2. Sistem Kehadiran & Sekolah Sabat (`hadir.html`)
- **Alur File**: `hadir.html` → `src/hadir.jsx` → `src/hadirApp.jsx`
- **Modul Pendukung**:
  - `src/components/hadir/DashboardCharts.jsx` (Visualisasi grafik kehadiran)
  - `src/utils/supabaseHadirAdapter.js` (Adapter baca/tulis Supabase & migrasi GAS)
  - `src/utils/hadirHelpers.js` (Helper tanggal Sabat, masking No. HP, format `YYYY-MM-DD`)
  - `src/constants/hadirConstants.js` (10 Poin Kegiatan Keterlibatan Anggota Kelas)
- **Framework**: React 19 + Tailwind CSS + pustaka CDN di `hadir.html` (`Chart.js`, `jsPDF`, `jspdf-autotable`, `xlsx`).
- **Fitur Utama**: Presensi Jemaat (Sekolah Sabat & Khotbah), 10 Poin Keterlibatan Anggota Kelas, Manajemen Data Jemaat/Kelas/Sub-Kelas/Petugas, Daftar Pokok Doa, Ulang Tahun Jemaat, dan Ekspor Laporan Bulanan/Multi-Bulan (PDF & Excel).
- **Backend**:
  - **Primary Read**: Supabase (`@supabase/supabase-js` via `anon` key) pada tabel `hadir_jemaat`, `hadir_kelas`, `hadir_sub_kelas`, `hadir_users`, `hadir_absen` (dengan auto-pagination per 1.000 baris), `hadir_tamu`, `hadir_keterlibatan`, dan `hadir_doa`.
  - **Primary Write**: Melalui **Supabase Edge Function** `functions/v1/hadir-write` (`callWriteFunction` dengan validasi PIN petugas/admin di sisi server).
  - **Fallback & Sinkronisasi**: Google Apps Script (`APPS_SCRIPT_URL` di `src/hadirApp.jsx`) serta fitur migrasi/cadangan ke Google Sheets.

### 3.3. Sistem Informasi Keuangan & Perbendaharaan (`laporan.html`)
- **Alur File**: `laporan.html` → `src/laporan/main.js`
- **Modul Pendukung (`src/laporan/`)**:
  - `supabaseAdapter.js`: Handler `supabaseGet` & `supabasePost`, pemeriksaan kesehatan tabel (`config`, `departments`, `units`, `income_types`, `income`, `expense`, `balances`, `users`, `logs`), migrasi 1-klik dari GAS ke Supabase, dan backup Supabase ke Google Sheets.
  - `styles.css`: Styling spesifik dashboard keuangan dan cetak laporan/kuitansi.
  - `modules/masterDataService.js`: CRUD Kategori Pemasukan, Departemen, Unit/Sektor, dan Manajemen Pengguna/Role.
  - `modules/receiptService.js`: Pembuatan kuitansi digital resolusi tinggi (HD) berbasis `html2canvas`, fungsi `terbilang`, dan pencetakan kuitansi.
  - `modules/seriesService.js`: Manajemen nomor seri kuitansi otomatis bulanan untuk 6 kategori (Pemasukan Kas Jemaat, `PEMB-`, `COST-`, `MBR-`, `CP-`, `PB-`).
  - `modules/reportExportService.js`: Pembuatan laporan keuangan standar GMAHK (HTML/PDF & Excel) lengkap dengan tanda tangan pejabat gereja & stempel (muncul bila transaksi bulan terkait berstatus *Approved*).
  - `modules/bulletinService.js`: Pembuatan pratinjau Buletin Keuangan Sabat untuk cetak PDF atau salin teks ke WhatsApp.
  - `modules/auditBackupService.js`: Pencatatan jejak audit (`logs`), unduh & validasi berkas cadangan `.json`, serta *auto-save draft* form pemasukan/pengeluaran.
  - `modules/uiService.js`: Inisialisasi `air-datepicker`, indikator kekuatan kata sandi, dan grafik donat departemen.
  - `modules/logoAsset.js`: Aset logo base64 GMAHK untuk pencetakan offline/PDF.
- **Framework**: Vanilla JavaScript (ES Modules) + Custom CSS (`src/laporan/styles.css` & `src/index.css`).

### 3.4. Portal Pembangunan & Donasi Lahan (`pembangunan.html`)
- **Alur File**: Mandiri di dalam `pembangunan.html` (memuat `/src/index.css` dan blok `<script>` inline).
- **Framework**: Vanilla JavaScript Inline + Tailwind CSS (tema *Luxury Serif* `Cormorant Garamond` + `Inter`, warna `navy` & `gold`).
- **Fitur Utama**: Statistik realisasi dana pembangunan, komitmen jemaat, & target dana (tersinkronisasi dengan pengaturan laporan keuangan), salin rekening donasi, form unggah bukti transfer donasi, tahapan/portofolio pembangunan, berita pembangunan, daftar panitia, dan panel Admin verifikasi donasi.
- **Backend**: Google Apps Script (`SCRIPT_URL` di `pembangunan.html`) dengan *auto-sync* setiap 30 detik.

### 3.5. Sistem Manajemen Inventaris Gereja (`inventaris.html`)
- **Alur File**: `inventaris.html` → `src/inventarisEntry.js` → `src/inventaris/main.js` + `src/inventaris/supabaseAdapter.js`
- **Framework**: Vanilla JavaScript (ES Modules) + Custom CSS di `inventaris.html` + `/src/index.css` + CDN (`JsBarcode`, `html2pdf.js`).
- **Fitur Utama**: Katalog aset gereja (tampilan Grid & List), pencarian & filter (kategori, status aktif/disposed, status pinjaman), pembuatan QR Code dengan logo gereja di tengah, cetak label QR (Kertas A4/PDF & Printer Thermal Bluetooth/Direct), pencatatan peminjaman aset, riwayat pemeliharaan/servis, dan laporan penyusutan nilai buku (*depreciation report*).
- **Backend**: Supabase (tabel `inventaris` & riwayat servis via `src/inventaris/supabaseAdapter.js`) sebagai database utama + Google Apps Script (`DEFAULT_API_URL`) sebagai cadangan otomatis & fitur migrasi 1-klik.

### 3.6. Panduan Pengguna Worship Presenter (`worship-presenter.html`)
- **Alur File**: Mandiri di dalam `worship-presenter.html`.
- **Fungsi**: Halaman dokumentasi statis berisi petunjuk penggunaan aplikasi desktop *Worship Presenter* bagi tim multimedia gereja, dilengkapi sinkronisasi tema gelap (`localStorage.getItem('theme')`).

---

## 4. Konvensi Styling, Tema, & PWA Offline

1. **Pusat CSS (`src/index.css`)**:
   - Mengimpor `@import "tailwindcss/base";`, `components`, dan `utilities`.
   - Berisi seluruh aturan CSS gabungan dari `stylemain.css`, `stylehadir.css`, dan `stylelaporan.css`.
   - Jika menambahkan class CSS kustom global, tambahkan di `src/index.css` (atau `src/laporan/styles.css` bila khusus untuk halaman laporan keuangan).
2. **Konfigurasi Tailwind (`tailwind.config.js`)**:
   - `darkMode: 'class'`
   - Warna kustom utama: `navy` (`50`–`950`, dengan `900: '#0b1a30'`), `gold` (`DEFAULT: '#C5A880'`, `50`–`900`, dengan `500: '#e7ae30'`), dan `obsidian`.
3. **Mekanisme Dark Mode**:
   - Halaman utama (`index.html`), kehadiran (`hadir.html`), dan panduan (`worship-presenter.html`) menggunakan `localStorage.getItem('theme')` (`'dark'` atau `'light'`) dan menerapkan class `dark` pada elemen `<html>` / `<body>`.
   - Halaman keuangan (`laporan.html`) menggunakan `localStorage.getItem('BISDAC_theme')` dan menerapkan atribut `data-theme="dark"` atau `data-theme="light"` pada elemen `<html>`.
4. **Service Worker & PWA (`public/sw.js`)**:
   - Mengelola dua cache: `STATIC_CACHE` (aset inti aplikasi) dan `DATA_CACHE` (`lagu_sion.json` dan 66 file `alkitab/1.json`–`66.json`).
   - Semua request ke `script.google.com` dan `supabase.co` di-*bypass* dari cache Service Worker agar data dinamis selalu mutakhir.
   - Pada lingkungan *development* (`localhost`, `127.0.0.1`, port `5173`/`4000`, atau IP lokal `192.168.x.x`/`10.x.x.x`), Service Worker otomatis di-*unregister* agar tidak menyebabkan *stale cache*.

---

## 5. Aturan Kritis & Pantangan bagi AI Agent (*Guardrails*)

1. **JANGAN Merusak atau Menimpa Penuh `src/indexApp.jsx`**:
   - `src/indexApp.jsx` adalah berkas komponen monolitik berukuran >1 MB (~24.276 baris).
   - Di `vite.config.js` terdapat plugin proteksi `safeguardIndexApp()` yang memantau ukuran `src/indexApp.jsx` dan menyinkronkan cadangannya ke `src/indexApp.jsx.bak`.
   - Saat memodifikasi `src/indexApp.jsx`, **selalu gunakan edit terarah (*targeted edit*)** pada baris yang relevan; jangan pernah menimpa seluruh file atau mengosongkannya.
2. **JANGAN Mengedit File Stub/Warisan**:
   - Jangan mengedit `src/laporanEntry.js` atau `src/pembangunanEntry.js` ketika diminta mengubah fitur laporan atau pembangunan.
   - Jangan mengedit `src/stylemain.css`, `src/stylehadir.css`, atau `src/stylelaporan.css` karena ketiganya tidak lagi di-bundle secara langsung.
3. **Pertahankan Arsitektur Dual-Database & Pagination Supabase**:
   - Supabase secara default membatasi hasil query `SELECT` hingga 1.000 baris. Untuk tabel dengan pertumbuhan data tinggi (seperti `hadir_absen`, `inventaris`, atau transaksi keuangan), selalu pertahankan mekanisme *pagination loop* (`.range(from, from + step - 1)`) yang sudah ada.
   - Jangan menghapus fitur *fallback* ke Google Apps Script atau tombol sinkronisasi/migrasi Google Sheets di halaman Admin.
   - Jangan pernah menaruh `service_role` key Supabase di kode klien (frontend). Operasi tulis yang membutuhkan hak akses tinggi (seperti di `hadir`) harus tetap melalui Supabase Edge Function (`hadir-write`).
4. **Ekspos Fungsi ke `window` pada Halaman Vanilla JS Modular**:
   - Pada `laporan.html` (`src/laporan/main.js`) dan `inventaris.html` (`src/inventaris/main.js`), banyak atribut `onclick="..."` dan `onchange="..."` di HTML yang memanggil fungsi secara global. Pastikan setiap fungsi handler baru yang dipanggil dari atribut HTML diekspos ke objek `window` (mis. `window.namaFungsi = namaFungsi`).
5. **Bahasa & Terminologi GMAHK**:
   - Gunakan Bahasa Indonesia yang baik, sopan, dan sesuai konteks Gereja Masehi Advent Hari Ketujuh (GMAHK), seperti: *Sabat*, *Sekolah Sabat*, *Perpuluhan*, *Persembahan Terpadu*, *Warta Jemaat*, *Roh Nubuat*, *Lagu Sion*, *Ketua Jemaat*, *Bendahara Jemaat*.
6. **Gunakan Modal & Toast Kustom**:
   - Utamakan penggunaan komponen modal konfirmasi dan *toast notification* kustom yang sudah tersedia di masing-masing halaman (`customConfirm` / `showToast` / `triggerConfirm` / `showCustomConfirm`) daripada `alert()` atau `confirm()` bawaan browser.

---

## 6. Perintah Pengembangan & Build (`package.json`)

- **Menjalankan Dev Server**: `npm run dev` (Vite dev server)
- **Build Production**: `npm run build` (Mem-build seluruh 6 halaman MPA ke direktori `dist/` dengan `emptyOutDir: false` dan pemisahan chunk vendor: `vendor-react`, `vendor-supabase`, `vendor-lucide`, `vendor-pdf`)
- **Preview Hasil Build**: `npm run preview`
- **Deploy ke GitHub Pages**: `npm run deploy` (Menjalankan `predeploy` / `npm run build` lalu mem-publish folder `dist/` via `gh-pages`)

