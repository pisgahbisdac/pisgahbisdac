-- ============================================================
-- SCRIPT KEAMANAN SUPABASE - BISDAC PISGAH (v2 - FINAL)
-- Jalankan script ini di: Supabase Dashboard > SQL Editor
--
-- Perubahan dari v1:
-- - anon key HANYA bisa SELECT (baca)
-- - INSERT / UPDATE / DELETE HANYA dari Edge Function
--   yang menggunakan service_role key (aman di server)
-- ============================================================

-- ============================================================
-- BAGIAN 1: AKTIFKAN RLS PADA SEMUA TABEL
-- ============================================================

ALTER TABLE hadir_jemaat       ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadir_kelas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadir_sub_kelas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadir_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadir_absen        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadir_tamu         ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadir_keterlibatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadir_doa          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- BAGIAN 2: HAPUS SEMUA POLICY LAMA
-- ============================================================

DROP POLICY IF EXISTS "anon_select_jemaat"       ON hadir_jemaat;
DROP POLICY IF EXISTS "anon_insert_jemaat"       ON hadir_jemaat;
DROP POLICY IF EXISTS "anon_update_jemaat"       ON hadir_jemaat;
DROP POLICY IF EXISTS "anon_delete_jemaat"       ON hadir_jemaat;

DROP POLICY IF EXISTS "anon_select_kelas"        ON hadir_kelas;
DROP POLICY IF EXISTS "anon_insert_kelas"        ON hadir_kelas;
DROP POLICY IF EXISTS "anon_update_kelas"        ON hadir_kelas;
DROP POLICY IF EXISTS "anon_delete_kelas"        ON hadir_kelas;

DROP POLICY IF EXISTS "anon_select_sub_kelas"    ON hadir_sub_kelas;
DROP POLICY IF EXISTS "anon_insert_sub_kelas"    ON hadir_sub_kelas;
DROP POLICY IF EXISTS "anon_update_sub_kelas"    ON hadir_sub_kelas;
DROP POLICY IF EXISTS "anon_delete_sub_kelas"    ON hadir_sub_kelas;

DROP POLICY IF EXISTS "anon_select_users"        ON hadir_users;
DROP POLICY IF EXISTS "anon_insert_users"        ON hadir_users;
DROP POLICY IF EXISTS "anon_update_users"        ON hadir_users;
DROP POLICY IF EXISTS "anon_delete_users"        ON hadir_users;

DROP POLICY IF EXISTS "anon_select_absen"        ON hadir_absen;
DROP POLICY IF EXISTS "anon_insert_absen"        ON hadir_absen;
DROP POLICY IF EXISTS "anon_update_absen"        ON hadir_absen;
DROP POLICY IF EXISTS "anon_delete_absen"        ON hadir_absen;

DROP POLICY IF EXISTS "anon_select_tamu"         ON hadir_tamu;
DROP POLICY IF EXISTS "anon_insert_tamu"         ON hadir_tamu;
DROP POLICY IF EXISTS "anon_update_tamu"         ON hadir_tamu;
DROP POLICY IF EXISTS "anon_delete_tamu"         ON hadir_tamu;

DROP POLICY IF EXISTS "anon_select_keterlibatan" ON hadir_keterlibatan;
DROP POLICY IF EXISTS "anon_insert_keterlibatan" ON hadir_keterlibatan;
DROP POLICY IF EXISTS "anon_update_keterlibatan" ON hadir_keterlibatan;
DROP POLICY IF EXISTS "anon_delete_keterlibatan" ON hadir_keterlibatan;

DROP POLICY IF EXISTS "anon_select_doa"          ON hadir_doa;
DROP POLICY IF EXISTS "anon_insert_doa"          ON hadir_doa;
DROP POLICY IF EXISTS "anon_update_doa"          ON hadir_doa;
DROP POLICY IF EXISTS "anon_delete_doa"          ON hadir_doa;

-- ============================================================
-- BAGIAN 3: POLICY BARU - anon HANYA BISA SELECT
-- INSERT/UPDATE/DELETE hanya dari service_role (Edge Function)
-- ============================================================

-- === hadir_jemaat ===
CREATE POLICY "anon_select_jemaat"
    ON hadir_jemaat FOR SELECT TO anon USING (true);

-- === hadir_kelas ===
CREATE POLICY "anon_select_kelas"
    ON hadir_kelas  FOR SELECT TO anon USING (true);

-- === hadir_sub_kelas ===
CREATE POLICY "anon_select_sub_kelas"
    ON hadir_sub_kelas FOR SELECT TO anon USING (true);

-- === hadir_absen ===
CREATE POLICY "anon_select_absen"
    ON hadir_absen  FOR SELECT TO anon USING (true);

-- === hadir_tamu ===
CREATE POLICY "anon_select_tamu"
    ON hadir_tamu   FOR SELECT TO anon USING (true);

-- === hadir_keterlibatan ===
CREATE POLICY "anon_select_keterlibatan"
    ON hadir_keterlibatan FOR SELECT TO anon USING (true);

-- === hadir_doa ===
-- Permohonan doa hanya bisa dibaca, tidak bisa ditulis langsung dari frontend
CREATE POLICY "anon_select_doa"
    ON hadir_doa FOR SELECT TO anon USING (true);

-- === hadir_users ===
-- PIN sensitif: anon TIDAK bisa baca sama sekali
-- Verifikasi PIN dilakukan di Edge Function dengan service_role
-- (Tidak ada SELECT policy untuk anon di tabel ini)

-- ============================================================
-- BAGIAN 4: VERIFIKASI HASIL
-- Jalankan query ini untuk memastikan semua tabel sudah aman
-- ============================================================

-- Cek status RLS:
SELECT
    tablename,
    rowsecurity AS "RLS Aktif"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'hadir_%'
ORDER BY tablename;

-- Cek semua policy:
SELECT
    tablename,
    policyname,
    roles,
    cmd AS "Operasi"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'hadir_%'
ORDER BY tablename, policyname;
