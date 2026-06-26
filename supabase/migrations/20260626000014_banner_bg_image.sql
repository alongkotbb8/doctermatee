-- Migration 014: เพิ่ม bg_image column ใน banners (ภาพ layer พื้นหลัง hero)
ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS bg_image text;

-- Rollback:
-- ALTER TABLE public.banners DROP COLUMN IF EXISTS bg_image;
