-- ============================================================
-- HOTFIX: Izinkan anon SELECT dari hadir_users
-- Diperlukan agar login fallback lokal tetap berfungsi
-- sementara Edge Function hadir-write belum di-deploy.
--
-- Setelah Edge Function aktif, policy ini bisa diubah
-- menjadi lebih ketat (hanya kolom nama & sub_kelas_nama).
-- ============================================================

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "anon_select_users" ON hadir_users;

-- Tambahkan SELECT policy untuk anon
CREATE POLICY "anon_select_users"
    ON hadir_users FOR SELECT TO anon USING (true);

-- Verifikasi
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'hadir_users'
ORDER BY policyname;
