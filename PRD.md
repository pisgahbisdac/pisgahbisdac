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

### 3.5 Tanda Tangan Dinamis pada Laporan PDF
- **FR 5.1:** Admin dapat mengatur gambar tanda tangan para pejabat gereja (Bendahara Jemaat, Ketua Pembangunan, Ketua Jemaat, Pendeta) melalui menu **Administrasi > Tanda Tangan**.
- **FR 5.2:** Foto tanda tangan yang diunggah akan di-resize secara otomatis (max 300px) dan disimpan sebagai Base64 ke sheet **Config** di backend.
- **FR 5.3:** Gambar tanda tangan **hanya** akan tercetak dalam Laporan PDF jika **semua transaksi** (Pemasukan & Pengeluaran) pada bulan tersebut telah **di-Approve** oleh Ketua Jemaat dan Pendeta.
- **FR 5.4:** Jika ada 1 saja transaksi yang belum disetujui, laporan akan tetap dicetak namun dengan baris tanda tangan kosong untuk mengakomodasi tanda tangan basah secara manual.
- **FR 5.5:** Terdapat opsi checkbox **"Tanda Tangan Manual (Cetak Kosong)"** di halaman Laporan Bulanan. Jika dicentang, laporan PDF akan selalu mengosongkan gambar tanda tangan.

### 3.6 Laporan Keuangan Pembangunan
- **FR 6.1:** Tersedia tombol khusus **"Cetak Lap. Pembangunan"** di halaman Laporan Bulanan untuk mencetak laporan khusus dana pembangunan.
- **FR 6.2:** Laporan Pembangunan mengkalkulasi saldo awal kas pembangunan dan merinci seluruh mutasi (donasi langsung, alokasi pembangunan, serta pengeluaran dari sumber Pembangunan).
- **FR 6.3:** Laporan Pembangunan memiliki **4 kolom tanda tangan**: Bendahara Jemaat, Ketua Pembangunan, Ketua Jemaat, dan Gembala Jemaat — dengan validasi approval yang sama seperti Laporan Keuangan Utama.

### 3.7 Tutup Buku (Closing Month)
- **FR 7.1:** Admin dapat melakukan **Tutup Buku** melalui tombol **"Manajemen Tutup Buku"** di halaman Laporan Bulanan.
- **FR 7.2:** Fitur ini membuka jendela Pop-up (Modal) yang memungkinkan Admin memilih **Bulan dan Tahun** secara bebas untuk ditutup atau dibuka.
- **FR 7.3:** Sistem menampilkan status terkini dari periode yang dipilih (*Terkunci* atau *Terbuka*).
- **FR 7.4:** Setelah bulan ditutup, sistem akan memblokir **penambahan, pengeditan, dan penghapusan** transaksi (baik pemasukan maupun pengeluaran) pada bulan tersebut.
- **FR 7.5:** Admin dapat membuka kembali bulan yang terkunci melalui modal yang sama (tombol **Buka Buku**).
- **FR 7.6:** Status closing disimpan secara permanen ke sheet **Config** (key: `closed_{tahun}_{bulan}`).

## 4. Persyaratan Non-Fungsional (Non-Functional Requirements)

- **Keamanan & Sinkronisasi:** Menggunakan arsitektur _serverless_ (Google Apps Script). Keamanan pada tingkat backend harus memvalidasi pencegahan edit mutasi jika array `approved_by` telah memuat "Ketua Jemaat" dan "Pendeta".
- **Kinerja UI:** Aplikasi berbasis SPA (*Single Page Application*) yang dibangun dengan arsitektur Vite. Peralihan antarmuka harus berjalan tanpa _reload_ halaman dengan waktu respons maksimal 1 detik saat perpindahan tab.
- **Responsivitas Layar:** Aplikasi menggunakan pendekatan _Mobile First_ dengan Tailwind CSS, menjamin tampilan proporsional mulai dari *smartphone* (kartu responsif) hingga *desktop* (tabel padat data).
- **Offline & Cache:** Memanfaatkan `localStorage` dan `sessionStorage` sebagai _cache layer_ utama. Data tidak diambil ulang (*re-fetched*) kecuali dipaksa melalui tombol "Sinkronisasi Manual" atau *login* awal.

## 5. Milestone & Rencana ke Depan
- ✅ Menyempurnakan dasbor visual untuk merangkum arus kas harian/bulanan (Telah Tersedia).
- ✅ Menyatukan sistem laporan gereja dengan sistem laporan khusus pembangunan fisik gereja.
- ✅ Tanda Tangan Dinamis pada Laporan PDF (otomatis berdasarkan status Approval).
- ✅ Manajemen Tutup Buku (Closing Month) untuk mengunci transaksi per bulan.
- Notifikasi _push_ untuk permintaan penyetujuan (Approval) jika *Service Worker* dan fitur peramban memadai.
