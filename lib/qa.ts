// ── กระทู้ถามตอบ (Q&A) — ดึงเฉพาะที่อนุมัติแล้ว + cache (tag "qa") ──
// ถ้า DB ยังไม่มีตาราง (ยังไม่รัน migration 009) จะคืนค่าว่างอย่างปลอดภัย
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export interface QAAnswer {
  id: string;
  author_name: string;
  body: string;
  is_official: boolean;
  created_at: string;
}

export interface QAQuestionListItem {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string | null;
  author_name: string;
  created_at: string;
  answerCount: number;
}

export interface QAQuestion {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string | null;
  author_name: string;
  created_at: string;
  answers: QAAnswer[];
}

export const getApprovedQuestions = unstable_cache(
  async (): Promise<QAQuestionListItem[]> => {
    try {
      const s = createServiceClient();
      const { data: qs, error } = await s
        .from("questions")
        .select("id, slug, title, body, category, author_name, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error || !qs) return [];
      const { data: ans } = await s.from("answers").select("question_id").eq("status", "approved");
      const counts = new Map<string, number>();
      (ans ?? []).forEach((a: { question_id: string }) => counts.set(a.question_id, (counts.get(a.question_id) ?? 0) + 1));
      return qs.map((q) => ({ ...q, answerCount: counts.get(q.id) ?? 0 }));
    } catch {
      return [];
    }
  },
  ["approved-questions"],
  { revalidate: 60, tags: ["qa"] }
);

export async function getQuestion(slug: string): Promise<QAQuestion | null> {
  const run = unstable_cache(
    async (): Promise<QAQuestion | null> => {
      try {
        const s = createServiceClient();
        const { data: q } = await s
          .from("questions")
          .select("id, slug, title, body, category, author_name, created_at")
          .eq("slug", slug)
          .eq("status", "approved")
          .single();
        if (!q) return null;
        const { data: ans } = await s
          .from("answers")
          .select("id, author_name, body, is_official, created_at")
          .eq("question_id", q.id)
          .eq("status", "approved")
          .order("is_official", { ascending: false })
          .order("created_at", { ascending: true });
        return { ...q, answers: (ans ?? []) as QAAnswer[] };
      } catch {
        return null;
      }
    },
    ["question", slug],
    { revalidate: 60, tags: ["qa"] }
  );
  return run();
}
