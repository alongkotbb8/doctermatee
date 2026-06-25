-- ============================================================
-- Doctermatee — Migration 010: เพิ่ม FAQ ให้บทความ (FAQPage schema)
-- faq: jsonb array ของ { q, a } — ใช้สร้าง FAQPage JSON-LD + แสดงท้ายบทความ
-- idempotent
-- ============================================================
alter table public.articles add column if not exists faq jsonb not null default '[]'::jsonb;
