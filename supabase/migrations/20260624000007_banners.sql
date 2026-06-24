-- ============================================================
-- Doctermatee — Migration 007: หลายแบนเนอร์ (carousel) + จัดการหลังบ้าน
-- ============================================================

create table if not exists public.banners (
  id                 uuid primary key default uuid_generate_v4(),
  title              text,
  accent             text,
  subtitle           text,
  image              text,
  cta_primary        text default 'เลือกสินค้า',
  cta_primary_href   text default '/products',
  cta_secondary      text default 'บทความสุขภาพ',
  cta_secondary_href text default '/articles',
  is_active          boolean not null default true,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now()
);

alter table public.banners enable row level security;

create policy "Anyone can view active banners"
  on public.banners for select using (is_active = true or public.is_admin());
create policy "Admin can manage banners"
  on public.banners for all using (public.is_admin());

-- ตัวอย่าง 2 แบนเนอร์ (auto-slide เห็นผลทันที) — แก้ได้ในหลังบ้าน
insert into public.banners (title, accent, subtitle, sort_order, is_active) values
('สุขภาพดี', 'เริ่มต้นที่นี่', 'อาหารเสริม วิตามิน และผลิตภัณฑ์ดูแลสุขภาพคุณภาพสูง พร้อมคำแนะนำจากแพทย์ผู้เชี่ยวชาญ จัดส่งฟรีเมื่อสั่งซื้อครบ ฿500', 1, true),
('ดีลพิเศษ', 'ลดสูงสุด 20%', 'รวมวิตามินและอาหารเสริมขายดี ราคาพิเศษประจำสัปดาห์ พร้อมส่งฟรีเมื่อครบ ฿500', 2, true);
