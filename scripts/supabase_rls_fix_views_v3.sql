-- ============================================================
-- FIX VIEW SECURITY INVOKER - GENERATE SQL MANUAL (v3)
-- ============================================================
-- CARA PAKAI:
-- 1. Jalankan query LANGKAH 1 dulu → salin output SQL-nya
-- 2. Jalankan LANGKAH 2 (drop views)
-- 3. Paste & jalankan hasil copy dari langkah 1
-- 4. Jalankan LANGKAH 3 untuk verifikasi
-- ============================================================

-- ============================================================
-- LANGKAH 1: Generate SQL CREATE VIEW siap pakai
-- Salin seluruh isi kolom "create_sql" dari hasil query ini,
-- lalu jalankan sebagai query baru.
-- ============================================================

SELECT
  '-- Recreate: ' || viewname || E'\n' ||
  'CREATE OR REPLACE VIEW public.' || quote_ident(viewname) ||
  E'\n  WITH (security_invoker = on)\nAS\n' ||
  definition || ';' AS create_sql
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('view_expense_no_photo', 'view_income_no_photo');

-- ============================================================
-- LANGKAH 2: Hapus view lama (jalankan setelah langkah 1)
-- ============================================================

-- DROP VIEW IF EXISTS public.view_expense_no_photo;
-- DROP VIEW IF EXISTS public.view_income_no_photo;

-- ============================================================
-- LANGKAH 3: Verifikasi setelah langkah 1 & 2 dijalankan
-- ============================================================

-- SELECT
--   c.relname AS viewname,
--   CASE
--     WHEN EXISTS (
--       SELECT 1 FROM unnest(c.reloptions) opt
--       WHERE opt LIKE 'security_invoker%'
--     ) THEN '✅ INVOKER'
--     ELSE '⚠️ DEFINER'
--   END AS security_mode
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public'
--   AND c.relkind = 'v'
--   AND c.relname IN ('view_expense_no_photo', 'view_income_no_photo');
