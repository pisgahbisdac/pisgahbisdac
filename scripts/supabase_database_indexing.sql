-- ============================================================
-- SCRIPT OPTIMALISASI DATABASE INDEXING - GMAHK PISGAH BISDAC (REVISED)
-- File: scripts/supabase_database_indexing.sql
-- Jalankan di: Supabase Dashboard > SQL Editor > New query
-- 
-- Perbaikan dari versi sebelumnya:
-- - hadir_absen: menggunakan kolom `jemaat_nama` (bukan `jemaat_id`)
-- - hadir_keterlibatan: menggunakan kolom `tanggal` & `sub_kelas_nama`
-- - hadir_users: menggunakan kolom `nama` & `sub_kelas_nama`
-- - inventaris: menggunakan kolom `name`, `category`, `location`, `status`
-- - inventory_services: menggunakan kolom `inventory_id`, `service_date`
-- ============================================================

-- ============================================================
-- BAGIAN 1: INDEX TABEL PRESENSI / KEHADIRAN (hadir_*)
-- ============================================================

-- 1.1 Tabel hadir_absen (Tabel paling sering dibaca & ditulis per Sabat)
-- Mempercepat pagination absensi (order by tanggal desc)
CREATE INDEX IF NOT EXISTS idx_hadir_absen_tanggal_desc 
    ON hadir_absen (tanggal DESC);

-- Mempercepat filter presensi per tanggal, sesi ibadah, dan sub kelas
CREATE INDEX IF NOT EXISTS idx_hadir_absen_composite 
    ON hadir_absen (tanggal, sesi, sub_kelas_nama);

-- Mempercepat pencarian riwayat absensi per nama anggota jemaat
CREATE INDEX IF NOT EXISTS idx_hadir_absen_jemaat_nama 
    ON hadir_absen (jemaat_nama);

-- Mempercepat rekap statistik status kehadiran (Hadir, Sakit, Izin, dll)
CREATE INDEX IF NOT EXISTS idx_hadir_absen_status 
    ON hadir_absen (status);


-- 1.2 Tabel hadir_jemaat (Daftar induk jemaat)
-- Mempercepat pengurutan nama jemaat alfabetis
CREATE INDEX IF NOT EXISTS idx_hadir_jemaat_nama 
    ON hadir_jemaat (nama ASC);

-- Mempercepat filter jemaat per unit / sub kelas
CREATE INDEX IF NOT EXISTS idx_hadir_jemaat_sub_kelas 
    ON hadir_jemaat (sub_kelas_nama);

-- Mempercepat filter status baptis
CREATE INDEX IF NOT EXISTS idx_hadir_jemaat_status_baptis 
    ON hadir_jemaat (status_baptis);


-- 1.3 Tabel hadir_doa (Permohonan doa jemaat)
-- Mempercepat filter doa berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_hadir_doa_tanggal 
    ON hadir_doa (tanggal DESC);


-- 1.4 Tabel hadir_tamu (Presensi tamu pengunjung)
-- Mempercepat filter data tamu per tanggal kebaktian
CREATE INDEX IF NOT EXISTS idx_hadir_tamu_tanggal 
    ON hadir_tamu (tanggal DESC);


-- 1.5 Tabel hadir_keterlibatan (Keterlibatan pelayanan)
CREATE INDEX IF NOT EXISTS idx_hadir_keterlibatan_tanggal 
    ON hadir_keterlibatan (tanggal DESC);

CREATE INDEX IF NOT EXISTS idx_hadir_keterlibatan_sub_kelas 
    ON hadir_keterlibatan (sub_kelas_nama);


-- 1.6 Tabel hadir_users (Petugas & Guru Sekolah Sabat)
CREATE INDEX IF NOT EXISTS idx_hadir_users_nama 
    ON hadir_users (nama);

CREATE INDEX IF NOT EXISTS idx_hadir_users_sub_kelas 
    ON hadir_users (sub_kelas_nama);


-- ============================================================
-- BAGIAN 2: INDEX TABEL LAPORAN KEUANGAN (income, expense, logs)
-- ============================================================

-- 2.1 Tabel income (Pemasukan Kas & Persepuluhan)
-- Mempercepat kueri getIncomeList per tahun & bulan
CREATE INDEX IF NOT EXISTS idx_income_year_month 
    ON income (year, month);

-- Mempercepat pengurutan transaksi berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_income_date 
    ON income (date DESC);

-- Mempercepat rekapitulasi berdasarkan jenis pemasukan
CREATE INDEX IF NOT EXISTS idx_income_type 
    ON income (income_type);

-- Mempercepat rekap per unit jemaat
CREATE INDEX IF NOT EXISTS idx_income_unit 
    ON income (unit_name);


-- 2.2 Tabel expense (Pengeluaran Kas)
-- Mempercepat kueri getExpenseList per tahun & bulan
CREATE INDEX IF NOT EXISTS idx_expense_year_month 
    ON expense (year, month);

-- Mempercepat pengurutan pengeluaran berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_expense_date 
    ON expense (date DESC);

-- Mempercepat rekapitulasi per departemen gereja
CREATE INDEX IF NOT EXISTS idx_expense_department 
    ON expense (department);

-- Mempercepat filter kas asal (source_balance)
CREATE INDEX IF NOT EXISTS idx_expense_source_balance 
    ON expense (source_balance);


-- 2.3 Tabel logs (Audit Trail & Log Aktivitas Sistem)
-- Mempercepat pembacaan riwayat aktivitas terbaru
CREATE INDEX IF NOT EXISTS idx_logs_timestamp 
    ON logs (timestamp DESC);

-- Mempercepat filter log per pengguna
CREATE INDEX IF NOT EXISTS idx_logs_username 
    ON logs (username);


-- ============================================================
-- BAGIAN 3: INDEX TABEL INVENTARIS & SERVIS ASET
-- ============================================================

-- 3.1 Tabel inventaris (Aset Gereja)
CREATE INDEX IF NOT EXISTS idx_inventaris_name 
    ON inventaris (name);

CREATE INDEX IF NOT EXISTS idx_inventaris_category 
    ON inventaris (category);

CREATE INDEX IF NOT EXISTS idx_inventaris_location 
    ON inventaris (location);

CREATE INDEX IF NOT EXISTS idx_inventaris_status 
    ON inventaris (status);


-- 3.2 Tabel inventory_services (Riwayat Pemeliharaan/Servis Aset)
CREATE INDEX IF NOT EXISTS idx_inv_services_inventory_id 
    ON inventory_services (inventory_id);

CREATE INDEX IF NOT EXISTS idx_inv_services_service_date 
    ON inventory_services (service_date DESC);


-- ============================================================
-- BAGIAN 4: PEMBARUAN STATISTIK POSTGRESQL QUERY PLANNER (ANALYZE)
-- ============================================================

ANALYZE hadir_absen;
ANALYZE hadir_jemaat;
ANALYZE hadir_doa;
ANALYZE hadir_tamu;
ANALYZE hadir_keterlibatan;
ANALYZE hadir_users;
ANALYZE income;
ANALYZE expense;
ANALYZE logs;
ANALYZE inventaris;
ANALYZE inventory_services;


-- ============================================================
-- BAGIAN 5: VERIFIKASI INDEKS YANG AKTIF
-- ============================================================

SELECT 
    tablename AS "Tabel",
    indexname AS "Nama Indeks"
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'hadir_absen', 'hadir_jemaat', 'hadir_doa', 'hadir_tamu', 'hadir_keterlibatan', 'hadir_users',
    'income', 'expense', 'logs',
    'inventaris', 'inventory_services'
  )
ORDER BY tablename, indexname;
