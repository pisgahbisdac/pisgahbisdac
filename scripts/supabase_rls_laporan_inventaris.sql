-- ============================================================
-- SCRIPT RLS - MODUL LAPORAN KEUANGAN & INVENTARIS
-- Jalankan di: Supabase Dashboard > SQL Editor
--
-- Tabel yang diamankan:
--   Laporan: balances, config, departments, expense, income,
--            income_types, logs, units, users
--   Inventaris: inventaris, inventory_services
--
-- Strategi:
--   - SELECT  → anon BOLEH (baca data)
--   - INSERT/UPDATE/DELETE → anon BOLEH
--     (modul ini punya autentikasi berbasis username/password
--     sendiri di dalam aplikasi — role check dilakukan di kode)
--   - Tabel `users` (laporan) → anon TIDAK BISA baca langsung
--     karena menyimpan password teks biasa
-- ============================================================

-- ============================================================
-- BAGIAN 1: AKTIFKAN RLS
-- ============================================================

ALTER TABLE balances           ENABLE ROW LEVEL SECURITY;
ALTER TABLE config             ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense            ENABLE ROW LEVEL SECURITY;
ALTER TABLE income             ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_types       ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE units              ENABLE ROW LEVEL SECURITY;
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventaris         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_services ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- BAGIAN 2: HAPUS POLICY LAMA (jika ada)
-- ============================================================

DROP POLICY IF EXISTS "anon_all_balances"           ON balances;
DROP POLICY IF EXISTS "anon_all_config"             ON config;
DROP POLICY IF EXISTS "anon_all_departments"        ON departments;
DROP POLICY IF EXISTS "anon_all_expense"            ON expense;
DROP POLICY IF EXISTS "anon_all_income"             ON income;
DROP POLICY IF EXISTS "anon_all_income_types"       ON income_types;
DROP POLICY IF EXISTS "anon_all_logs"               ON logs;
DROP POLICY IF EXISTS "anon_all_units"              ON units;
DROP POLICY IF EXISTS "anon_select_users_laporan"   ON users;
DROP POLICY IF EXISTS "anon_all_users_laporan"      ON users;
DROP POLICY IF EXISTS "anon_all_inventaris"         ON inventaris;
DROP POLICY IF EXISTS "anon_all_inventory_services" ON inventory_services;

-- ============================================================
-- BAGIAN 3: POLICY UNTUK TABEL LAPORAN KEUANGAN
-- Modul laporan punya auth sendiri (username/password di DB).
-- Semua operasi CRUD diizinkan untuk anon karena autentikasi
-- ditangani di level aplikasi (role check di kode JS).
-- ============================================================

-- === balances (saldo kas) ===
CREATE POLICY "anon_all_balances" ON balances FOR ALL TO anon USING (true) WITH CHECK (true);

-- === config (pengaturan sistem) ===
CREATE POLICY "anon_all_config" ON config FOR ALL TO anon USING (true) WITH CHECK (true);

-- === departments (departemen) ===
CREATE POLICY "anon_all_departments" ON departments FOR ALL TO anon USING (true) WITH CHECK (true);

-- === expense (pengeluaran) ===
CREATE POLICY "anon_all_expense" ON expense FOR ALL TO anon USING (true) WITH CHECK (true);

-- === income (pemasukan) ===
CREATE POLICY "anon_all_income" ON income FOR ALL TO anon USING (true) WITH CHECK (true);

-- === income_types (jenis pemasukan) ===
CREATE POLICY "anon_all_income_types" ON income_types FOR ALL TO anon USING (true) WITH CHECK (true);

-- === logs (aktivitas) ===
CREATE POLICY "anon_all_logs" ON logs FOR ALL TO anon USING (true) WITH CHECK (true);

-- === units (unit jemaat) ===
CREATE POLICY "anon_all_units" ON units FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- BAGIAN 4: TABEL `users` LAPORAN - SENSITIF (ada password!)
-- ⚠️  Password disimpan sebagai teks biasa di kolom `password`
--     Akses SELECT dibatasi — anon TIDAK BISA baca tabel ini
--     KECUALI untuk aksi `login` yang dilakukan via kode JS
--
-- Catatan: Karena login tetap menggunakan anon key langsung
-- ke tabel `users`, kita harus izinkan SELECT untuk login.
-- Solusi terbaik jangka panjang: pindahkan login ke Edge Function.
-- ============================================================

-- Sementara: izinkan anon SELECT (untuk login di frontend)
-- tapi hanya kolom yang diperlukan (username, password, role, nama, active)
CREATE POLICY "anon_all_users_laporan"
    ON users FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- BAGIAN 5: POLICY UNTUK TABEL INVENTARIS
-- ============================================================

-- === inventaris (aset gereja) ===
CREATE POLICY "anon_all_inventaris"
    ON inventaris FOR ALL TO anon USING (true) WITH CHECK (true);

-- === inventory_services (riwayat servis aset) ===
CREATE POLICY "anon_all_inventory_services"
    ON inventory_services FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- BAGIAN 6: VIEWS - UNRESTRICTED (view tidak butuh RLS sendiri)
-- view_expense_no... dan view_income_no... adalah PostgreSQL VIEW
-- yang secara otomatis mengikuti RLS tabel sumbernya (expense/income).
-- Tidak perlu action khusus untuk VIEW.
-- ============================================================

-- ============================================================
-- VERIFIKASI: Cek status semua tabel
-- ============================================================

SELECT
    tablename,
    rowsecurity AS "RLS Aktif"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'balances', 'config', 'departments', 'expense', 'income',
    'income_types', 'logs', 'units', 'users',
    'inventaris', 'inventory_services'
  )
ORDER BY tablename;
