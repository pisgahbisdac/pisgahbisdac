# Panduan Lengkap Pisgah Bisdac (Sistem Laporan Keuangan & Informasi Gereja)

Dokumen ini adalah gabungan lengkap dari *Product Requirements Document (PRD)*, Arsitektur Sistem (Kerangka), dan Panduan Penggunaan Harian aplikasi Pisgah Bisdac. 

---

## 1. Pendahuluan & Latar Belakang
Pisgah Bisdac adalah aplikasi berbasis *Single Page Application* (SPA) yang diperuntukkan bagi manajemen dan jemaat gereja. Tujuan utama aplikasi ini adalah:
1. Mendigitalkan proses pembukuan (pemasukan dan pengeluaran) secara rapi dan otomatis.
2. Mengintegrasikan alur persetujuan (*approval workflow*) bertingkat oleh pimpinan gereja untuk transparansi dan akuntabilitas.
3. Menyimpan bukti transaksi berupa foto dengan kompresi otomatis untuk menghemat ruang penyimpanan.

---

## 2. Arsitektur & Struktur Direktori (Vite)

Aplikasi dibangun menggunakan *Vite* dengan dukungan *React* dan Vanilla JavaScript, menggunakan styling *Tailwind CSS*. Backend menggunakan arsitektur *Serverless* via **Google Apps Script (GAS)**.

```text
pisgahbisdac/
├── public/                   # Aset statis (ikon, manifest PWA, sw.js)
├── src/                      # Kode logika utama
│   ├── index.jsx             # Entry point React (index.html)
│   ├── hadir.jsx             # Entry point absensi (hadir.html)
│   ├── laporanEntry.js       # Entry point Vanilla JS (laporan.html)
│   └── index.css             # Injeksi Tailwind & CSS kustom
├── dist/                     # HASIL KOMPILASI (Production-ready) untuk hosting
├── index.html                # Halaman utama portal
├── hadir.html                # Halaman kehadiran
├── laporan.html              # Halaman manajemen laporan & keuangan
└── vite.config.js            # Konfigurasi Vite
```

### Perintah Operasional
- `npm run dev`: Menjalankan server lokal dengan fitur *Hot Reloading*.
- `npm run build`: Mengkompilasi aplikasi ke folder `dist/` untuk diunggah (di-hosting) ke server produksi.
- `npm run preview`: Mensimulasikan server hosting lokal untuk menguji folder `dist/`.

---

## 3. Pembagian Hak Akses (Role-Based Access Control)

1. **Admin:** Memiliki kendali penuh. Mengelola pengguna, master data, konfigurasi tanda tangan, dan fitur **Tutup Buku** (Closing Month).
2. **Bendahara:** Pengguna operasional yang menginput data Pemasukan, Pengeluaran, dan Pindah Buku. Mengunggah foto kuitansi dan mencetak laporan.
3. **Ketua Jemaat:** Pemeriksa tingkat pertama. Berhak memberikan **Approval (Persetujuan)** pada setiap transaksi yang diinput Bendahara.
4. **Pendeta (Gembala Jemaat):** Pemeriksa tingkat akhir. Transaksi terkunci sepenuhnya setelah mendapat *Approval* ganda.
5. **Viewer / Publik:** Akses baca (*read-only*) terbatas. Tidak dapat melihat data pribadi yang spesifik.

---

## 4. Alur Persetujuan (Approval Workflow) & Keamanan

- **Pending:** Status awal saat Bendahara memasukkan transaksi baru. Nominal dan keterangan masih bisa diubah.
- **1/2 Acc:** Jika Ketua Jemaat *atau* Pendeta telah menekan tombol Approve.
- **Disetujui Penuh (Terkunci):** Jika keduanya telah menyetujui. Aplikasi maupun Backend akan memblokir perubahan pada tanggal, departemen, dan nominal transaksi. Bendahara hanya dapat menambahkan atau memperbaiki lampiran foto bukti.
- **Tutup Buku (Closing Month):** Fitur Admin untuk mengunci keseluruhan bulan. Setelah ditutup, tidak ada yang dapat menginput, mengedit, atau menghapus transaksi pada bulan tersebut.

---

## 5. Pemahaman Alur Kas (Cash & Bank)

Sistem membedakan letak penyimpanan uang fisik:
*   **[Bank]:** Saldo utama yang tersimpan secara aman di dalam rekening bank.
*   **[Di Tangan]:** Uang tunai/kas yang fisik uangnya dipegang secara langsung.

**Aturan Main:**
*   Seluruh transaksi masa lalu (Legacy) dianggap dan diakumulasikan ke saldo **Bank**.
*   Saat melakukan **Input Pemasukan**, Anda wajib memilih tujuannya (masuk ke Bank atau Tunai).
*   Saat melakukan **Input Pengeluaran**, Anda wajib memperhatikan sumbernya (misal: *Kas Jemaat [Bank]* vs *Kas Jemaat [Di Tangan]*).

---

## 6. Panduan Fitur Harian Bendahara

### A. Input Pemasukan
Terdapat form khusus untuk Pemasukan Perpuluhan. Memasukkan satu nilai dapat dipecah untuk *Perpuluhan, Terpadu, Khusus Jemaat, dan Daerah*. Sistem akan secara otomatis mengalokasikan pecahan dana tersebut ke *Kas Daerah*, *Kas Jemaat*, dan *Kas Pembangunan* berdasarkan persentase baku dari sistem. Nominal akan otomatis diformat dengan titik ribuan.

### B. Pindah Buku (Mutasi Kas)
Fitur ini digunakan saat Anda membawa uang *Di Tangan* (misal hasil kolekte tunai) ke bank untuk disetorkan/ditransfer.
- **Cara Kerja:** Ini dicatat oleh sistem sebagai *Pengeluaran* khusus dengan kategori "Mutasi Kas / Setor Bank".
- **Dampak:** Saldo *Di Tangan* berkurang, saldo *Di Bank* bertambah. Catatan Pemasukan aslinya (seperti total Perpuluhan bulan ini) tidak akan berkurang, sehingga laporan pendapatan tetap utuh dan akurat.

### C. Unggah Bukti Kuitansi
Anda dapat mengunggah hingga **3 lembar foto** per transaksi. Aplikasi akan melakukan **kompresi otomatis** pada browser sebelum mengirimnya ke server, menghemat penggunaan kuota dan mempercepat *loading* data di Google Sheets.

### D. Tanda Tangan Dinamis di PDF
Admin dapat mengunggah foto tanda tangan Pejabat Gereja. Tanda tangan digital ini **hanya** akan tercetak pada Laporan Bulanan PDF jika **100% transaksi pada bulan tersebut telah disetujui (Approved)** oleh Ketua Jemaat dan Pendeta. Jika ada transaksi yang masih *Pending*, baris tanda tangan akan dikosongkan untuk tanda tangan basah.

---

## 7. Troubleshooting

- **Data Tidak Tampil / Terlihat Minus:** Karena aplikasi berbasis SPA dan menggunakan fitur Caching (*Offline first*), selalu pastikan untuk menekan tombol melayang **Sinkronisasi Manual** jika Anda mencurigai data belum diperbarui.
- **Nominal Error:** Pastikan tidak ada karakter aneh yang dimasukkan. Kolom input nominal telah dirancang untuk secara otomatis mengkonversi ketikan menjadi format angka ribuan (titik).
- **Update Tidak Tampil di Hosting:** Semua perbaikan HTML dan JS yang dilakukan secara lokal harus dikompilasi menggunakan `npm run build` dan folder `dist/` harus di-upload ulang ke server hosting Anda agar perubahannya *live* di internet.
