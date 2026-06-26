-- ============================================================
-- Doctermatee — Migration 012: ใบกำกับภาษี (Tax Invoice)
--  invoice_counters : ตัวนับเลขรัน (รีเซ็ตรายเดือน, atomic กันเลขซ้ำ)
--  tax_invoices     : ใบกำกับภาษีที่ออกแล้ว (เก็บถาวร ไม่ลบ)
--  orders.tax_invoice : คำขอ + ข้อมูลผู้ซื้อ (เต็มรูป) จาก checkout
-- เลขรัน: CD (ย่อ) / ICD (เต็ม) + ปีค.ศ. + เดือน2หลัก + รัน4หลัก (รีเซ็ตทุกเดือน)
-- idempotent
-- ============================================================

-- ---------- ตัวนับเลขรัน ----------
create table if not exists public.invoice_counters (
  prefix  text not null,            -- 'CD' | 'ICD'
  period  text not null,            -- 'YYYYMM' (รีเซ็ตเมื่อเปลี่ยนเดือน)
  last_no integer not null default 0,
  primary key (prefix, period)
);

alter table public.invoice_counters enable row level security;
drop policy if exists "Admin manage counters" on public.invoice_counters;
create policy "Admin manage counters" on public.invoice_counters for all using (public.is_admin());

-- ฟังก์ชันออกเลขถัดไปแบบ atomic (upsert + row lock ในคำสั่งเดียว → ไม่มีเลขซ้ำ/ข้าม)
create or replace function public.next_invoice_no(p_prefix text, p_period text)
returns integer
language plpgsql
as $$
declare v_no integer;
begin
  insert into public.invoice_counters (prefix, period, last_no)
    values (p_prefix, p_period, 1)
  on conflict (prefix, period)
    do update set last_no = public.invoice_counters.last_no + 1
  returning last_no into v_no;
  return v_no;
end;
$$;

-- ---------- ใบกำกับภาษีที่ออกแล้ว ----------
create table if not exists public.tax_invoices (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null unique references public.orders(id) on delete cascade,
  number        text not null unique,        -- เลขที่ใบกำกับภาษี
  type          text not null check (type in ('short','full')),
  buyer         jsonb,                        -- ข้อมูลผู้ซื้อ (เต็มรูป) / snapshot ที่อยู่ (ย่อ)
  base_amount   numeric(12,2) not null,       -- มูลค่าก่อน VAT
  vat_amount    numeric(12,2) not null,       -- VAT
  vat_rate      numeric(4,2) not null default 7,
  total         numeric(12,2) not null,       -- รวม VAT (= ยอดที่จ่ายจริง)
  issued_at     timestamptz not null default now()
);

create index if not exists idx_tax_invoices_issued on public.tax_invoices(issued_at desc);

alter table public.tax_invoices enable row level security;
-- admin เท่านั้น (พิมพ์/export ผ่านหลังบ้าน) — หน้าร้านไม่ต้องเห็น
drop policy if exists "Admin manage tax invoices" on public.tax_invoices;
create policy "Admin manage tax invoices" on public.tax_invoices for all using (public.is_admin());

-- ---------- คำขอใบกำกับภาษีบนออเดอร์ ----------
-- เก็บคำขอ (เต็มรูป) + ข้อมูลผู้ซื้อที่ลูกค้ากรอกตอน checkout
-- โครงสร้าง: { "type":"full", "buyer_type":"company|person", "name":"", "branch":"head|branch",
--             "branch_code":"", "tax_id":"", "address":"", "subdistrict":"", "district":"",
--             "province":"", "postal_code":"", "email":"", "phone":"" }
alter table public.orders add column if not exists tax_invoice jsonb;
