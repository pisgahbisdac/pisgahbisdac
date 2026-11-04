-- ============================================================================
-- SKRIP SQL SUPABASE: TAMPILAN RAPI & MUDAH DIBACA UNTUK PORTAL_JADWAL
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Buat ulang portal_jadwal dengan kolom teks yang rapi & mudah dibaca manusia (tanpa JSON mentah di kolom utama)
DROP TABLE IF EXISTS public.portal_jadwal;

CREATE TABLE public.portal_jadwal (
    tanggal TEXT PRIMARY KEY,
    hari_ibadah TEXT,
    pengkhotbah_renungan TEXT,
    judul_dan_ayat TEXT,
    lagu_sion TEXT,
    petugas_khotbah TEXT,
    petugas_sekolah_sabat TEXT,
    petugas_rabu TEXT,
    tim_musik TEXT,
    tim_diakon TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Buat juga tabel rincian per petugas (persis seperti tampilan baris di Google Sheets)
DROP TABLE IF EXISTS public.portal_jadwal_rincian;

CREATE TABLE public.portal_jadwal_rincian (
    id TEXT PRIMARY KEY,
    tanggal TEXT NOT NULL,
    hari_ibadah TEXT,
    sesi_ibadah TEXT NOT NULL,
    tugas TEXT NOT NULL,
    nama_petugas TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Aktifkan RLS & Kebijakan Akses
ALTER TABLE public.portal_jadwal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_jadwal_rincian ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read portal_jadwal" ON public.portal_jadwal;
CREATE POLICY "Public read portal_jadwal" ON public.portal_jadwal FOR SELECT USING (true);
DROP POLICY IF EXISTS "App sync portal_jadwal" ON public.portal_jadwal;
CREATE POLICY "App sync portal_jadwal" ON public.portal_jadwal FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read portal_jadwal_rincian" ON public.portal_jadwal_rincian;
CREATE POLICY "Public read portal_jadwal_rincian" ON public.portal_jadwal_rincian FOR SELECT USING (true);
DROP POLICY IF EXISTS "App sync portal_jadwal_rincian" ON public.portal_jadwal_rincian;
CREATE POLICY "App sync portal_jadwal_rincian" ON public.portal_jadwal_rincian FOR ALL USING (true) WITH CHECK (true);
