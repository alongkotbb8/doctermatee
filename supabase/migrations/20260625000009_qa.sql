-- ============================================================
-- Doctermatee — Migration 009: กระทู้ถามตอบ (Q&A / QAPage)
--  questions : คำถามจากผู้ใช้ (อนุมัติก่อนแสดง)
--  answers   : คำตอบ (ผู้ใช้ทั่วไป + คำตอบทางการจากทีมงาน is_official)
-- idempotent: รันซ้ำได้ปลอดภัย
-- ============================================================

create table if not exists public.questions (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  title       text not null,
  body        text not null,
  category    text,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text not null,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);

create table if not exists public.answers (
  id          uuid primary key default uuid_generate_v4(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text not null,
  body        text not null,
  is_official boolean not null default false,  -- คำตอบทางการจากทีมงาน → ใช้เป็น acceptedAnswer
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_questions_status on public.questions(status, created_at desc);
create index if not exists idx_answers_question on public.answers(question_id, status);

alter table public.questions enable row level security;
alter table public.answers   enable row level security;

-- ── questions ──
drop policy if exists "Anyone can view approved questions" on public.questions;
create policy "Anyone can view approved questions"
  on public.questions for select using (status = 'approved' or public.is_admin());
-- ผู้ใช้ล็อกอินตั้งคำถามได้ — บังคับเริ่มที่ pending (กัน self-approve ผ่าน supabase-js ตรง)
drop policy if exists "Logged-in users can ask questions" on public.questions;
create policy "Logged-in users can ask questions"
  on public.questions for insert with check (auth.uid() = user_id and status = 'pending');
drop policy if exists "Admin can manage questions" on public.questions;
create policy "Admin can manage questions"
  on public.questions for all using (public.is_admin());

-- ── answers ──
drop policy if exists "Anyone can view approved answers" on public.answers;
create policy "Anyone can view approved answers"
  on public.answers for select using (status = 'approved' or public.is_admin());
-- ตอบได้ — บังคับ pending และห้ามตั้ง is_official เอง (เฉพาะ admin)
drop policy if exists "Logged-in users can answer" on public.answers;
create policy "Logged-in users can answer"
  on public.answers for insert with check (auth.uid() = user_id and status = 'pending' and is_official = false);
drop policy if exists "Admin can manage answers" on public.answers;
create policy "Admin can manage answers"
  on public.answers for all using (public.is_admin());

-- ============================================================
-- Seed: ตัวอย่าง 2 กระทู้ + คำตอบทางการ (อนุมัติแล้ว) เพื่อให้หน้าไม่ว่างและ QAPage schema สมบูรณ์
-- ============================================================
insert into public.questions (slug, title, body, category, author_name, status, created_at) values
('vitamin-c-kin-kap-collagen-dai-mai', 'กินวิตามินซีพร้อมคอลลาเจนได้ไหม?', 'อยากทราบว่าทานวิตามินซีพร้อมกับคอลลาเจนในมื้อเดียวกันได้หรือเปล่า จะตีกันไหมครับ', 'การกินอาหารเสริม', 'คุณสมชาย', 'approved', '2026-05-10 09:00:00+07'),
('fish-oil-kin-ton-nai-di', 'น้ำมันปลาควรกินตอนไหนถึงดีที่สุด?', 'เพิ่งซื้อน้ำมันปลามาทาน อยากทราบว่าควรกินตอนเช้าหรือเย็น และต้องกินพร้อมอาหารไหม', 'การกินอาหารเสริม', 'คุณมานี', 'approved', '2026-05-18 14:30:00+07')
on conflict (slug) do nothing;

insert into public.answers (question_id, author_name, body, is_official, status, created_at)
select q.id, 'ทีมเภสัชกร Doctermatee',
  'ทานพร้อมกันได้และยังส่งเสริมกันด้วยครับ วิตามินซีช่วยให้ร่างกายสังเคราะห์คอลลาเจนได้ดีขึ้น แนะนำให้ทานพร้อมหรือหลังอาหารเพื่อการดูดซึมที่ดีและลดการระคายเคืองกระเพาะ',
  true, 'approved', '2026-05-10 11:00:00+07'
from public.questions q where q.slug = 'vitamin-c-kin-kap-collagen-dai-mai'
and not exists (select 1 from public.answers a where a.question_id = q.id);

insert into public.answers (question_id, author_name, body, is_official, status, created_at)
select q.id, 'ทีมเภสัชกร Doctermatee',
  'แนะนำให้ทานน้ำมันปลาพร้อมอาหารที่มีไขมัน เพื่อช่วยการดูดซึม Omega-3 และลดอาการเรอกลิ่นคาว จะทานมื้อไหนก็ได้ ขอให้เป็นเวลาเดิมสม่ำเสมอทุกวันครับ',
  true, 'approved', '2026-05-18 16:00:00+07'
from public.questions q where q.slug = 'fish-oil-kin-ton-nai-di'
and not exists (select 1 from public.answers a where a.question_id = q.id);
