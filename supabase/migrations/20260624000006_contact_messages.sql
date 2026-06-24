-- ============================================================
-- Doctermatee — Migration 006: ตารางข้อความติดต่อ/ปรึกษาแพทย์
-- ============================================================

create table if not exists public.contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  phone      text,
  topic      text,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- เขียนผ่าน service role (API) เท่านั้น; แอดมินอ่านได้
create policy "Admin can view contact messages"
  on public.contact_messages for all using (public.is_admin());
