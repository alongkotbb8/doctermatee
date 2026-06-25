"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconTrash, IconPlus } from "@/components/icons";

interface ArticleFAQ { q: string; a: string }

interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  read_time_min: number | null;
  is_published: boolean;
  faq?: ArticleFAQ[] | null;
}

interface Props { article?: ArticleData }

function toSlug(str: string) {
  return str.toLowerCase()
    .replace(/[^฀-๿a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export default function ArticleForm({ article }: Props) {
  const router = useRouter();
  const isEdit = !!article?.id;

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [coverImage, setCoverImage] = useState(article?.cover_image ?? "");
  const [readTime, setReadTime] = useState(String(article?.read_time_min ?? "5"));
  const [isPublished, setIsPublished] = useState(article?.is_published ?? false);
  const [faq, setFaq] = useState<ArticleFAQ[]>(article?.faq ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!title || !slug) { setError("กรุณาใส่ชื่อบทความและ slug"); return; }
    setSaving(true); setError("");
    const supabase = createClient();
    const payload = {
      title, slug, excerpt, content,
      cover_image: coverImage || null,
      read_time_min: parseInt(readTime) || 5,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      faq: faq.filter((f) => f.q.trim() && f.a.trim()),
    };
    if (isEdit) {
      const { error: e } = await supabase.from("articles").update(payload).eq("id", article!.id!);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("articles").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["articles"] }) }).catch(() => {});
    setSaving(false); setSaved(true);
    setTimeout(() => router.push("/admin/articles"), 900);
  }

  async function deleteArticle() {
    if (!confirm("ลบบทความนี้?")) return;
    const supabase = createClient();
    await supabase.from("articles").delete().eq("id", article!.id!);
    await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["articles"] }) }).catch(() => {});
    router.push("/admin/articles");
  }

  const inp = { width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" } as React.CSSProperties;
  const foc = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = "var(--teal-600)"; };
  const blr = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = "var(--neutral-200)"; };

  const addFaq = () => setFaq((f) => [...f, { q: "", a: "" }]);
  const upFaq = (i: number, patch: Partial<ArticleFAQ>) => setFaq((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const rmFaq = (i: number) => setFaq((f) => f.filter((_, j) => j !== i));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <a href="/admin/articles" style={{ fontSize: 13, color: "var(--neutral-400)", textDecoration: "none" }}>← บทความ</a>
        <span style={{ color: "var(--neutral-200)" }}>/</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)", margin: 0 }}>
          {isEdit ? "แก้ไขบทความ" : "เพิ่มบทความใหม่"}
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={lbl}>ชื่อบทความ *</label>
              <input value={title} onChange={(e) => { setTitle(e.target.value); if (!isEdit) setSlug(toSlug(e.target.value)); }}
                style={inp} placeholder="5 วิตามินที่ควรทานทุกวัน" onFocus={foc} onBlur={blr} />
            </div>
            <div>
              <label style={lbl}>Slug (URL) *</label>
              <input value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} style={inp} placeholder="5-vitamins-daily" onFocus={foc} onBlur={blr} />
            </div>
            <div>
              <label style={lbl}>บทคัดย่อ</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
                style={{ ...inp, height: "auto", padding: "10px 14px", resize: "vertical" }}
                placeholder="สรุปสั้นๆ เพื่อแสดงในรายการบทความ" onFocus={foc} onBlur={blr} />
            </div>
            <div>
              <label style={lbl}>รูปภาพ (URL)</label>
              <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} style={inp} placeholder="https://..." onFocus={foc} onBlur={blr} />
            </div>
          </div>

          <div className="card" style={{ padding: "22px 24px" }}>
            <label style={lbl}>เนื้อหาบทความ (HTML)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={20}
              style={{ ...inp, height: "auto", padding: "12px 14px", resize: "vertical", fontFamily: "monospace", fontSize: 13, lineHeight: 1.6 }}
              placeholder="<h2>หัวข้อ</h2><p>เนื้อหา...</p>" onFocus={foc} onBlur={blr} />
            <p style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 6 }}>รองรับ HTML: h2, h3, p, ul, ol, strong, a, img, blockquote</p>
          </div>

          {/* FAQ → FAQPage schema */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <label style={{ ...lbl, marginBottom: 0 }}>คำถามที่พบบ่อย (FAQ) — สร้าง FAQPage schema ให้ Google</label>
              <button type="button" onClick={addFaq} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--teal-50)", color: "var(--teal-700)", border: "1px solid var(--teal-200)", borderRadius: "var(--radius-full)", padding: "6px 14px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                <IconPlus size={14} color="var(--teal-700)" /> เพิ่ม
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              {faq.map((f, i) => (
                <div key={i} style={{ border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-md)", padding: 14, background: "var(--neutral-50)" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={f.q} onChange={(e) => upFaq(i, { q: e.target.value })} style={{ ...inp, flex: 1 }} placeholder="คำถาม" onFocus={foc} onBlur={blr} />
                    <button type="button" onClick={() => rmFaq(i)} style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 10px", cursor: "pointer", flexShrink: 0 }}><IconTrash size={13} color="#EF4444" /></button>
                  </div>
                  <textarea value={f.a} onChange={(e) => upFaq(i, { a: e.target.value })} rows={2} style={{ ...inp, height: "auto", padding: "10px 14px", resize: "vertical", marginTop: 8 }} placeholder="คำตอบ" onFocus={foc} onBlur={blr} />
                </div>
              ))}
              {faq.length === 0 && <p style={{ fontSize: 13, color: "var(--neutral-400)", textAlign: "center", padding: "12px 0" }}>ยังไม่มี FAQ — ไม่บังคับ แต่ช่วยให้ขึ้น rich result บน Google</p>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 14, margin: "0 0 14px" }}>การเผยแพร่</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>เวลาอ่าน (นาที)</label>
              <input type="number" value={readTime} onChange={(e) => setReadTime(e.target.value)} style={{ ...inp, width: "100%" }} min="1" onFocus={foc} onBlur={blr} />
            </div>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontSize: 14, color: "var(--neutral-700)" }}>เผยแพร่</span>
              <div onClick={() => setIsPublished(!isPublished)} style={{ width: 44, height: 24, borderRadius: 12, background: isPublished ? "var(--teal-500)" : "var(--neutral-200)", position: "relative", cursor: "pointer", transition: "background .2s" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: isPublished ? 22 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
              </div>
            </label>
          </div>

          {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>{error}</div>}

          <button onClick={save} disabled={saving} style={{ background: saved ? "var(--teal-700)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "13px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {saved ? <><IconCheck size={16} color="#fff" /> บันทึกแล้ว</> : saving ? "กำลังบันทึก…" : isEdit ? "บันทึก" : "สร้างบทความ"}
          </button>

          {isEdit && (
            <button onClick={deleteArticle} style={{ background: "none", border: "1px solid #FECACA", borderRadius: "var(--radius-full)", padding: "11px 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <IconTrash size={14} color="#EF4444" /> ลบบทความ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6 };
