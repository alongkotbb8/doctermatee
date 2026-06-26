-- Migration 013: เพิ่ม is_featured และ is_new ให้ products
-- is_featured = แสดงในหน้าแรก (สินค้าแนะนำ)
-- is_new      = ติดแท็ก "สินค้าใหม่" บน product card

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_new      boolean NOT NULL DEFAULT false;

-- index เพื่อ query เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_new      ON products (is_new)      WHERE is_new      = true;

-- Rollback:
-- ALTER TABLE products DROP COLUMN IF EXISTS is_featured, DROP COLUMN IF EXISTS is_new;
