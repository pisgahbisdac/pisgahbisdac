# Product Requirements Document (PRD)
**Project Name:** Pisgah Bisdac (Sistem Laporan Keuangan & Informasi Gereja)
**Version:** 1.1

## 1. Pendahuluan
### 1.1 Latar Belakang
Pisgah Bisdac adalah aplikasi berbasis web yang diperuntukkan bagi manajemen dan jemaat gereja untuk mengelola jadwal pelayanan, manajemen warta, hingga laporan keuangan secara terpadu. Pengelolaan keuangan gereja membutuhkan transparansi, akuntabilitas, dan persetujuan bertingkat agar integritas data tetap terjaga. 

### 1.2 Tujuan
1. Mendigitalkan proses pembukuan (pemasukan dan pengeluaran) dan laporan keuangan gereja.
2. Mengintegrasikan alur persetujuan (*approval workflow*) bertingkat oleh pimpinan gereja.
3. Menyimpan bukti transaksi berupa foto kuitansi secara efisien dengan manajemen format dan ukuran file yang dioptimalkan secara otomatis.

## 2. Target Pengguna (User Roles)
Sistem ini menggunakan *Role-Based Access Control* (RBAC) pada antarmuka *Laporan Keuangan*, dengan pembagian peran sebagai berikut:
1. **Admin:** Pengelola aplikasi dengan akses penuh ke seluruh sistem, termasuk *Master Data*, penghapusan data secara permanen, dan manajemen akun pengguna.
2. **Bendahara:** Pengguna operasional harian yang menginput data transaksi pemasukan/pengeluaran, mengunggah bukti kuitansi, dan mengelola entri.
3. **Ketua Jemaat:** Pihak pemeriksa yang memiliki tanggung jawab melakukan tinjauan (*review*) dan memberikan Persetujuan (*Approval*) terhadap transaksi yang dimasukkan Bendahara.
4. **Pendeta:** Pimpinan gereja yang juga bertindak sebagai pihak pemeriksa dan pemberi *Approval* akhir pada transaksi keuangan.
5. **Viewer / Publik:** Pengguna yang hanya memiliki akses baca (Read-only) untuk melihat laporan keuangan tanpa bisa memodifikasi atau mengakses detail privasi.

## 3. Fitur dan Persyaratan Produk (Requirements)

### 3.1 Manajemen Transaksi (Pemasukan & Pengeluaran)
- **FR 1.1:** Bendahara dan Admin dapat menambahkan transaksi baru dengan detail seperti tanggal, sumber dana/departemen, nominal, dan catatan.
- **FR 1.2:** Bendahara dan Admin dapat mengedit transaksi yang telah dibuat, **asalkan** transaksi tersebut belum mendapatkan persetujuan penuh.

### 3.2 Alur Persetujuan (Approval Workflow)
- **FR 2.1:** Transaksi baru secara otomatis berstatus `Pending`.
- **FR 2.2:** Ketua Jemaat dan Pendeta akan melihat tombol `Approve` pada baris histori transaksi yang belum disetujui penuh.
- **FR 2.3:** Jika salah satu (Ketua atau Pendeta) memberikan persetujuan, sistem mengubah status menjadi `1/2 Acc`.
- **FR 2.4:** Jika keduanya telah menyetujui, status transaksi menjadi `Disetujui` (Approve Penuh).
- **FR 2.5:** Transaksi yang telah `Disetujui` akan dikunci secara logika (dikunci antarmukanya & backend-nya). *Field* penting seperti tanggal, nominal, nama pemberi/penerima tidak dapat diedit lagi oleh siapa pun.
- **FR 2.6:** Tersedia filter (tab) khusus untuk meninjau transaksi berdasarkan Status Approval (Pending / Approved).
- **FR 2.7:** Terdapat fungsionalitas **Approve Semua (Bulk Approve)** yang memungkinkan pihak berwenang (Ketua Jemaat/Pendeta) menyetujui seluruh transaksi yang belum disetujui sekaligus dalam satu kali aksi.

### 3.3 Manajemen Bukti Kuitansi (Multi-Upload)
- **FR 3.1:** Pengguna (Bendahara/Admin) dapat mengunggah hingga maksimal **3 lembar foto kuitansi** untuk satu transaksi sekaligus.
- **FR 3.2:** Foto dapat diedit atau ditambah meskipun transaksi sudah berstatus `Disetujui` (namun field lain tetap terkunci).
- **FR 3.3:** Sistem wajib melakukan kompresi gambar (*client-side canvas compression*) sebelum dikirim ke server untuk memastikan *payload* tetap ringan.
- **FR 3.4:** Pemrosesan banyak file dilakukan secara *sequential* (berurutan) menggunakan sistem _async/await_ untuk menghindari gangguan (_race-condition_) ketika mengunggah format gambar yang beragam.

### 3.4 Pencarian, Filter & Laporan
- **FR 4.1:** Pengguna dapat memfilter histori berdasarkan rentang waktu (Bulan dan Tahun), jenis transaksi, atau melakukan pencarian berdasarkan kata kunci.
- **FR 4.2:** Tersedia fitur untuk men-Cetak atau men-Download rekapitulasi transaksi (Laporan PDF/Excel).

## 4. Persyaratan Non-Fungsional (Non-Functional Requirements)

- **Keamanan & Sinkronisasi:** Menggunakan arsitektur _serverless_ (Google Apps Script). Keamanan pada tingkat backend harus memvalidasi pencegahan edit mutasi jika array `approved_by` telah memuat "Ketua Jemaat" dan "Pendeta".
- **Kinerja UI:** Aplikasi berbasis SPA (*Single Page Application*) yang dibangun dengan arsitektur Vite. Peralihan antarmuka harus berjalan tanpa _reload_ halaman dengan waktu respons maksimal 1 detik saat perpindahan tab.
- **Responsivitas Layar:** Aplikasi menggunakan pendekatan _Mobile First_ dengan Tailwind CSS, menjamin tampilan proporsional mulai dari *smartphone* (kartu responsif) hingga *desktop* (tabel padat data).
- **Offline & Cache:** Memanfaatkan `localStorage` dan `sessionStorage` sebagai _cache layer_ utama. Data tidak diambil ulang (*re-fetched*) kecuali dipaksa melalui tombol "Sinkronisasi Manual" atau *login* awal.

## 5. Milestone & Rencana ke Depan
- Menyempurnakan dasbor visual untuk merangkum arus kas harian/bulanan (Telah Tersedia).
- Menyatukan sistem laporan gereja dengan sistem laporan khusus pembangunan fisik gereja.
- Notifikasi _push_ untuk permintaan penyetujuan (Approval) jika *Service Worker* dan fitur peramban memadai.
