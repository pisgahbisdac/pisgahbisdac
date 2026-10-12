-- =========================================================================
-- SQL Schema for PISGAH BISDAC Kehadiran Jemaat (Attendance) in Supabase
-- Jalankan query ini di Dashboard Supabase -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Table: hadir_jemaat
CREATE TABLE IF NOT EXISTS public.hadir_jemaat (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    gender VARCHAR(20),
    tgl_lahir VARCHAR(20),
    status_baptis VARCHAR(50),
    status_jemaat VARCHAR(150),
    kelas_nama VARCHAR(150),
    sub_kelas_nama VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: hadir_kelas
CREATE TABLE IF NOT EXISTS public.hadir_kelas (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: hadir_sub_kelas
CREATE TABLE IF NOT EXISTS public.hadir_sub_kelas (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) UNIQUE NOT NULL,
    kelas_nama VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: hadir_users (Akun Guru / Petugas Absen & Admin Backup)
CREATE TABLE IF NOT EXISTS public.hadir_users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) UNIQUE NOT NULL,
    sub_kelas_nama VARCHAR(150),
    pin VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: hadir_absen (Presensi Anggota Sekolah Sabat & Khotbah)
CREATE TABLE IF NOT EXISTS public.hadir_absen (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    jemaat_nama VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL,
    sesi VARCHAR(50) NOT NULL,
    sub_kelas_nama VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_hadir_absen UNIQUE (tanggal, jemaat_nama, sesi)
);

-- 6. Table: hadir_tamu (Catatan Tamu Tambahan)
CREATE TABLE IF NOT EXISTS public.hadir_tamu (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    sesi VARCHAR(50) NOT NULL,
    sub_kelas_nama VARCHAR(150) NOT NULL,
    jumlah INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_hadir_tamu UNIQUE (tanggal, sesi, sub_kelas_nama)
);

-- 7. Table: hadir_keterlibatan (10 Poin Keterlibatan Anggota)
CREATE TABLE IF NOT EXISTS public.hadir_keterlibatan (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    sub_kelas_nama VARCHAR(150) NOT NULL,
    values JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_hadir_keterlibatan UNIQUE (tanggal, sub_kelas_nama)
);

-- 8. Table: hadir_doa (Permohonan Doa Jemaat)
CREATE TABLE IF NOT EXISTS public.hadir_doa (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(150),
    no_hp VARCHAR(50),
    permohonan TEXT,
    tanggal VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks untuk pencarian dan filter cepat
CREATE INDEX IF NOT EXISTS idx_hadir_absen_tgl_sesi ON public.hadir_absen(tanggal, sesi);
CREATE INDEX IF NOT EXISTS idx_hadir_absen_jemaat ON public.hadir_absen(jemaat_nama);
CREATE INDEX IF NOT EXISTS idx_hadir_tamu_tgl ON public.hadir_tamu(tanggal);
CREATE INDEX IF NOT EXISTS idx_hadir_keterlibatan_tgl ON public.hadir_keterlibatan(tanggal);

-- Aktifkan Row Level Security (RLS) dan Beri Izin Akses Anon (Client Key)
ALTER TABLE public.hadir_jemaat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadir_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadir_sub_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadir_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadir_absen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadir_tamu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadir_keterlibatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadir_doa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on hadir_jemaat" ON public.hadir_jemaat;
CREATE POLICY "Allow all on hadir_jemaat" ON public.hadir_jemaat FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on hadir_kelas" ON public.hadir_kelas;
CREATE POLICY "Allow all on hadir_kelas" ON public.hadir_kelas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on hadir_sub_kelas" ON public.hadir_sub_kelas;
CREATE POLICY "Allow all on hadir_sub_kelas" ON public.hadir_sub_kelas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on hadir_users" ON public.hadir_users;
CREATE POLICY "Allow all on hadir_users" ON public.hadir_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on hadir_absen" ON public.hadir_absen;
CREATE POLICY "Allow all on hadir_absen" ON public.hadir_absen FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on hadir_tamu" ON public.hadir_tamu;
CREATE POLICY "Allow all on hadir_tamu" ON public.hadir_tamu FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on hadir_keterlibatan" ON public.hadir_keterlibatan;
CREATE POLICY "Allow all on hadir_keterlibatan" ON public.hadir_keterlibatan FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on hadir_doa" ON public.hadir_doa;
CREATE POLICY "Allow all on hadir_doa" ON public.hadir_doa FOR ALL USING (true) WITH CHECK (true);
