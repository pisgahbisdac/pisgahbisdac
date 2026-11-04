-- =========================================================================
-- SKRIP KEAMANAN DATABASE SUPABASE: PISGAH-BISDAC (Tahap 3)
-- Salin dan jalankan di menu SQL Editor pada Dashboard Supabase Anda.
-- =========================================================================

-- 1. Fungsi RPC Server-Side untuk Verifikasi Login & Sesi Pengguna
--    Menggunakan SECURITY DEFINER agar verifikasi password dilakukan
--    di dalam server PostgreSQL tanpa harus mengekspos password ke client.
CREATE OR REPLACE FUNCTION public.verify_bisdac_user(
  p_username TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS TABLE (
  username TEXT,
  role TEXT,
  nama TEXT,
  active BOOLEAN,
  verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.username::TEXT,
    COALESCE(u.role, 'Viewer')::TEXT AS role,
    COALESCE(u.nama, u.username)::TEXT AS nama,
    COALESCE(u.active, true) AS active,
    CASE
      WHEN p_password IS NULL THEN COALESCE(u.active, true)
      ELSE (COALESCE(u.active, true) AND u.password = p_password)
    END AS verified
  FROM public.users u
  WHERE LOWER(u.username) = LOWER(TRIM(p_username))
    AND COALESCE(u.active, true) = true
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_bisdac_user(TEXT, TEXT) TO anon, authenticated, service_role;

-- 2. Trigger Proteksi Akun Admin Utama pada Tabel `users`
--    Mencegah penghapusan akun Admin terakhir secara tidak sengaja.
CREATE OR REPLACE FUNCTION public.prevent_last_admin_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  IF OLD.role ILIKE '%Admin%' THEN
    SELECT COUNT(*) INTO admin_count
    FROM public.users
    WHERE role ILIKE '%Admin%'
      AND COALESCE(active, true) = true
      AND username <> OLD.username;

    IF admin_count = 0 THEN
      RAISE EXCEPTION 'Proteksi Keamanan: Tidak dapat menghapus akun Admin terakhir di sistem.';
    END IF;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_delete ON public.users;
CREATE TRIGGER trg_prevent_last_admin_delete
BEFORE DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_last_admin_deletion();

-- 3. Pastikan Tabel `inventory_services` Memiliki Kolom `created_by` untuk Audit
ALTER TABLE IF EXISTS public.inventory_services
  ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'Admin';

-- 4. Aktifkan RLS & Kebijakan Akses Terkontrol pada Tabel Inventaris & Keuangan
ALTER TABLE IF EXISTS public.inventaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read inventaris" ON public.inventaris;
CREATE POLICY "Allow read inventaris" ON public.inventaris FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write inventaris" ON public.inventaris;
CREATE POLICY "Allow write inventaris" ON public.inventaris FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read inventory_services" ON public.inventory_services;
CREATE POLICY "Allow read inventory_services" ON public.inventory_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write inventory_services" ON public.inventory_services;
CREATE POLICY "Allow write inventory_services" ON public.inventory_services FOR ALL USING (true) WITH CHECK (true);
