-- =========================================================================
-- TABEL INVENTARIS & SERVIS ASET GEREJA PISGAH BISDAC
-- =========================================================================

-- 18. Table: inventaris (Data Koleksi Aset & Inventaris)
CREATE TABLE IF NOT EXISTS public.inventaris (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    source VARCHAR(150),
    date_acquired VARCHAR(50),
    location VARCHAR(150),
    pic VARCHAR(150),
    qty NUMERIC DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'Unit',
    value NUMERIC DEFAULT 0,
    taksasi NUMERIC DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    dispose_reason TEXT,
    dispose_price NUMERIC DEFAULT 0,
    loan_status VARCHAR(50) DEFAULT 'Tersedia',
    borrowed_by VARCHAR(150),
    expected_return_date VARCHAR(50),
    sub_items TEXT,
    photo TEXT,
    pic2 TEXT,
    pic3 TEXT,
    pic4 TEXT,
    depreciation_years NUMERIC DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Table: inventory_services (Riwayat Servis / Pemeliharaan Aset)
CREATE TABLE IF NOT EXISTS public.inventory_services (
    id SERIAL PRIMARY KEY,
    inventory_id VARCHAR(50) NOT NULL REFERENCES public.inventaris(id) ON DELETE CASCADE,
    service_date VARCHAR(50) NOT NULL,
    description TEXT,
    cost NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa pencarian inventaris
CREATE INDEX IF NOT EXISTS idx_inventaris_category ON public.inventaris(category);
CREATE INDEX IF NOT EXISTS idx_inventaris_status ON public.inventaris(status);
CREATE INDEX IF NOT EXISTS idx_inventory_services_inv_id ON public.inventory_services(inventory_id);

-- Row Level Security (RLS)
ALTER TABLE public.inventaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on inventaris" ON public.inventaris;
CREATE POLICY "Allow all on inventaris" ON public.inventaris FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on inventory_services" ON public.inventory_services;
CREATE POLICY "Allow all on inventory_services" ON public.inventory_services FOR ALL USING (true) WITH CHECK (true);
