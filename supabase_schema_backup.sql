-- SQL Schema for PISGAH BISDAC Supabase Database
-- You can use this to back up your table structures or recreate the database.

-- 1. Table: config
CREATE TABLE IF NOT EXISTS public.config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: departments
CREATE TABLE IF NOT EXISTS public.departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: units
CREATE TABLE IF NOT EXISTS public.units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: income_types
CREATE TABLE IF NOT EXISTS public.income_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    pct_daerah NUMERIC DEFAULT 0,
    pct_jemaat NUMERIC DEFAULT 0,
    pct_bangun NUMERIC DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: balances
CREATE TABLE IF NOT EXISTS public.balances (
    id SERIAL PRIMARY KEY,
    department VARCHAR(150) UNIQUE NOT NULL,
    amount NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table: users
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama VARCHAR(150),
    role VARCHAR(50) DEFAULT 'Viewer',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table: income
CREATE TABLE IF NOT EXISTS public.income (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    income_type VARCHAR(150),
    nama_pemberi VARCHAR(150),
    unit_name VARCHAR(150),
    receipt_no VARCHAR(50),
    amount NUMERIC DEFAULT 0,
    alloc_daerah NUMERIC DEFAULT 0,
    alloc_jemaat NUMERIC DEFAULT 0,
    alloc_bangun NUMERIC DEFAULT 0,
    note TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(100),
    receipt_photo TEXT,
    receipt_photo_2 TEXT,
    receipt_photo_3 TEXT
);

-- 8. Table: expense
CREATE TABLE IF NOT EXISTS public.expense (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    department VARCHAR(150),
    source_balance VARCHAR(150),
    receipt_no VARCHAR(50),
    amount NUMERIC DEFAULT 0,
    nama_penerima VARCHAR(150),
    note TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(100),
    receipt_photo TEXT,
    receipt_photo_2 TEXT,
    receipt_photo_3 TEXT
);

-- 9. Table: logs
CREATE TABLE IF NOT EXISTS public.logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(100),
    action VARCHAR(100),
    detail TEXT
);

-- =========================================================================
-- TABEL KEHADIRAN JEMAAT (ATTENDANCE)
-- =========================================================================

-- 10. Table: hadir_jemaat
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

-- 11. Table: hadir_kelas
CREATE TABLE IF NOT EXISTS public.hadir_kelas (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Table: hadir_sub_kelas
CREATE TABLE IF NOT EXISTS public.hadir_sub_kelas (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) UNIQUE NOT NULL,
    kelas_nama VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Table: hadir_users (Akun Guru / Petugas Absen & Admin Backup)
CREATE TABLE IF NOT EXISTS public.hadir_users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) UNIQUE NOT NULL,
    sub_kelas_nama VARCHAR(150),
    pin VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Table: hadir_absen (Presensi Anggota Sekolah Sabat & Khotbah)
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

-- 15. Table: hadir_tamu (Catatan Tamu Tambahan)
CREATE TABLE IF NOT EXISTS public.hadir_tamu (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    sesi VARCHAR(50) NOT NULL,
    sub_kelas_nama VARCHAR(150) NOT NULL,
    jumlah INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_hadir_tamu UNIQUE (tanggal, sesi, sub_kelas_nama)
);

-- 16. Table: hadir_keterlibatan (10 Poin Keterlibatan Anggota)
CREATE TABLE IF NOT EXISTS public.hadir_keterlibatan (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    sub_kelas_nama VARCHAR(150) NOT NULL,
    values JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_hadir_keterlibatan UNIQUE (tanggal, sub_kelas_nama)
);

-- 17. Table: hadir_doa (Permohonan Doa Jemaat)
CREATE TABLE IF NOT EXISTS public.hadir_doa (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(150),
    no_hp VARCHAR(50),
    permohonan TEXT,
    tanggal VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS & Policies
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

