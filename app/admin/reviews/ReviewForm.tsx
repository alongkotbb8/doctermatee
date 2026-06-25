"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconTrash, IconPlus } from "@/components/icons";

interface DBProduct { rank?: number; name: string; price: string; rating: number; bestFor: string; pros?: string[]; cons?: string[]; productHref?: string; highlight?: boolean; }
interface DBSection { heading: string; body: string[]; }
interface DBFaq { q: string; a: string; }

interface ReviewData {
  id?: string;
  slug: string;
  question: string;
  category: string;
  summary: string;
  intro: string | null;
  author: string | null;
  author_role: string | null;
  products: DBProduct[] | null;
  comparison_note: string | null;
  sections: DBSection[] | null;
  faq: DBFaq[] | null;
  verdict: string | null;
  is_published: boolean;
  published_at?: string | null;
}

interface Props { review?: ReviewData }

interface ProductRow { name: string; price: string; rating: string; bestFor: string; productHref: string; highlight: boolean; prosText: string; consText: string; }
interface SectionRow { heading: string; bodyText: string; }

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^฀-๿a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}
const splitLines = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);

export default function ReviewForm({ review }: Props) {
  const router = useRouter();
  const isEdit = !!review?.id;

  const [slug, setSlug] = useState(review?.slug ?? "");
  const [question, setQuestion] = useState(review?.question ?? "");
  const [category, setCategory] = useState(review?.category ?? "");
  const [summary, setSummary] = useState(review?.summary ?? "");
  const [intro, setIntro] = useState(review?.intro ?? "");
  const [author, setAuthor] = useState(review?.author ?? "ภญ. มาตี เวลเนส");
  const [authorRole, setAuthorRole] = useState(review?.author_role ?? "เภสัชกรประจำ Doctermatee");
  const [comparisonNote, setComparisonNote] = useState(review?.comparison_note ?? "");
  const [verdict, setVerdict] = useState(review?.verdict ?? "");
  const [isPublished, setIsPublished] = useState(review?.is_published ?? false);

  const [products, setProducts] = useState<ProductRow[]>(
    (review?.products ?? []).map((p) => ({
      name: p.name ?? "", price: p.price ?? "", rating: String(p.rating ?? 4.5), bestFor: p.bestFor ?? "",
      productHref: p.productHref ?? "", highlight: !!p.highlight,
      prosText: (p.pros ?? []).join("\n"), consText: (p.cons ?? []).join("\n"),
    }))
  );
  const [sections, setSections] = useState<SectionRow[]>(
    (review?.sections ?? []).map((s) => ({ heading: s.heading ?? "", bodyText: (s.body ?? []).join("\n") }))
  );
  const [faq, setFaq] = useState<DBFaq[]>(review?.faq ?? []);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!question || !slug || !category || !summary) { setError("กรุณากรอก: คำถาม, slug, หมวด และคำตอบสั้น"); return; }
    if (products.length === 0) { setError("ต้องมีอย่างน้อย 1 ผลิตภัณฑ์ในตารางเปรียบเทียบ"); return; }
    setSaving(true); setError("");
    const supabase = createClient();

    const payload = {
      slug, question, category, summary,
      intro: intro || null,
      author: author || "Doctermatee",
      author_role: authorRole || null,
      comparison_note: comparisonNote || null,
      verdict: verdict || null,
      products: products.map((p, i) => ({
        rank: i + 1,
        name: p.name,
        price: p.price,
        rating: parseFloat(p.rating) || 0,
        bestFor: p.bestFor,
        pros: splitLines(p.prosText),
        cons: splitLines(p.consText),
        ...(p.productHref ? { productHref: p.productHref } : {}),
        ...(p.highlight ? { highlight: true } : {}),
      })),
      sections: sections.map((s) => ({ heading: s.heading, body: splitLines(s.bodyText) })),
      faq: faq.filter((f) => f.q && f.a),
      is_published: isPublished,
      published_at: isPublished ? (review?.published_at ?? new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };

    if (isEdit) {
      const { error: e } = await supabase.from("reviews").update(payload).eq("id", review!.id!);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("reviews").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["reviews"] }) }).catch(() => {});
    setSaving(false); setSaved(true);
    setTimeout(() => router.push("/admin/reviews"), 900);
  }

  async function deleteReview() {
    if (!confirm("ลบรีวิวนี้?")) return;
    const supabase = createClient();
    await supabase.from("reviews").delete().eq("id", review!.id!);
    await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["reviews"] }) }).catch(() => {});
    router.push("/admin/reviews");
  }

  // ── helpers สำหรับ array rows ──
  const addProduct = () => setProducts((p) => [...p, { name: "", price: "", rating: "4.5", bestFor: "", productHref: "", highlight: false, prosText: "", consText: "" }]);
  const upProduct = (i: number, patch: Partial<ProductRow>) => setProducts((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const rmProduct = (i: number) => setProducts((p) => p.filter((_, j) => j !== i));

  const addSection = () => setSections((s) => [...s, { heading: "", bodyText: "" }]);
  const upSection = (i: number, patch: Partial<SectionRow>) => setSections((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const rmSection = (i: number) => setSections((s) => s.filter((_, j) => j !== i));

  const addFaq = () => setFaq((f) => [...f, { q: "", a: "" }]);
  const upFaq = (i: number, patch: Partial<DBFaq>) => setFaq((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const rmFaq = (i: number) => setFaq((f) => f.filter((_, j) => j !== i));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <a href="/admin/reviews" style={{ fontSize: 13, color: "var(--neutral-400)", textDecoration: "none" }}>← รีวิว</a>
        <span style={{ color: "var(--neutral-200)" }}>/</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)", margin: 0 }}>
          {isEdit ? "แก้ไขรีวิว" : "เพิ่มรีวิวใหม่"}
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ข้อมูลหลัก */}
          <div className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={cardH}>ข้อมูลหลัก</h2>
            <div>
              <label style={lbl}>คำถาม (หัวข้อ H1) *</label>
              <input value={question} onChange={(e) => { setQuestion(e.target.value); if (!isEdit) setSlug(toSlug(e.target.value)); }} style={inp} placeholder="วิตามินซียี่ห้อไหนดีที่สุดในปี 2026?" onFocus={foc} onBlur={blr} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Slug (URL) *</label>
                <input value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} style={inp} placeholder="vitamin-c-yi-ho-nai-di" onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={lbl}>หมวด *</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} style={inp} placeholder="วิตามินซี" onFocus={foc} onBlur={blr} />
              </div>
            </div>
            <div>
              <label style={lbl}>คำตอบสั้น (40–60 คำ — แสดงบนสุด สำคัญต่อ AEO) *</label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} style={ta} placeholder="ตอบคำถามตรง ๆ ใน 2–3 ประโยค ระบุตัวที่แนะนำและเหตุผล" onFocus={foc} onBlur={blr} />
            </div>
            <div>
              <label style={lbl}>เกริ่นนำ</label>
              <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} style={ta} placeholder="ย่อหน้าเปิด อธิบายภาพรวม" onFocus={foc} onBlur={blr} />
            </div>
          </div>

          {/* ตารางเปรียบเทียบ (ผลิตภัณฑ์) */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ ...cardH, margin: 0 }}>ผลิตภัณฑ์ในตารางเปรียบเทียบ (เรียงตามอันดับ)</h2>
              <button onClick={addProduct} style={addBtn}><IconPlus size={14} color="var(--teal-700)" /> เพิ่ม</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {products.map((p, i) => (
                <div key={i} style={rowBox}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--neutral-500)" }}>อันดับ #{i + 1}</span>
                    <button onClick={() => rmProduct(i)} style={rmBtn}><IconTrash size={13} color="#EF4444" /></button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <input value={p.name} onChange={(e) => upProduct(i, { name: e.target.value })} style={inp} placeholder="ชื่อผลิตภัณฑ์" onFocus={foc} onBlur={blr} />
                    <input value={p.price} onChange={(e) => upProduct(i, { price: e.target.value })} style={inp} placeholder="฿590" onFocus={foc} onBlur={blr} />
                    <input type="number" step="0.1" min="0" max="5" value={p.rating} onChange={(e) => upProduct(i, { rating: e.target.value })} style={inp} placeholder="คะแนน 0–5" onFocus={foc} onBlur={blr} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <input value={p.bestFor} onChange={(e) => upProduct(i, { bestFor: e.target.value })} style={inp} placeholder="เหมาะกับ / จุดเด่นสั้น ๆ" onFocus={foc} onBlur={blr} />
                    <input value={p.productHref} onChange={(e) => upProduct(i, { productHref: e.target.value })} style={inp} placeholder="ลิงก์สินค้า (ไม่บังคับ) /products?q=..." onFocus={foc} onBlur={blr} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <textarea value={p.prosText} onChange={(e) => upProduct(i, { prosText: e.target.value })} rows={3} style={ta} placeholder="ข้อดี (บรรทัดละ 1 ข้อ)" onFocus={foc} onBlur={blr} />
                    <textarea value={p.consText} onChange={(e) => upProduct(i, { consText: e.target.value })} rows={3} style={ta} placeholder="ข้อเสีย (บรรทัดละ 1 ข้อ)" onFocus={foc} onBlur={blr} />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "var(--neutral-700)", cursor: "pointer" }}>
                    <input type="checkbox" checked={p.highlight} onChange={(e) => upProduct(i, { highlight: e.target.checked })} />
                    ตัวแนะนำ (ไฮไลต์ในตาราง + ใช้ใน schema)
                  </label>
                </div>
              ))}
              {products.length === 0 && <p style={emptyHint}>ยังไม่มีผลิตภัณฑ์ — กด “เพิ่ม”</p>}
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={lbl}>หมายเหตุเกณฑ์ให้คะแนน (ใต้ตาราง)</label>
              <input value={comparisonNote} onChange={(e) => setComparisonNote(e.target.value)} style={inp} placeholder="คะแนนรวมพิจารณาจาก: ..." onFocus={foc} onBlur={blr} />
            </div>
          </div>

          {/* เนื้อหาเชิงลึก (sections) */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ ...cardH, margin: 0 }}>หัวข้อเชิงลึก (หัวข้อย่อย = คำถามที่คนถาม)</h2>
              <button onClick={addSection} style={addBtn}><IconPlus size={14} color="var(--teal-700)" /> เพิ่ม</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sections.map((s, i) => (
                <div key={i} style={rowBox}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={s.heading} onChange={(e) => upSection(i, { heading: e.target.value })} style={{ ...inp, flex: 1 }} placeholder="หัวข้อย่อย เช่น ควรกินตอนไหน?" onFocus={foc} onBlur={blr} />
                    <button onClick={() => rmSection(i)} style={rmBtn}><IconTrash size={13} color="#EF4444" /></button>
                  </div>
                  <textarea value={s.bodyText} onChange={(e) => upSection(i, { bodyText: e.target.value })} rows={3} style={{ ...ta, marginTop: 10 }} placeholder="เนื้อหา (เว้นบรรทัด = ย่อหน้าใหม่)" onFocus={foc} onBlur={blr} />
                </div>
              ))}
              {sections.length === 0 && <p style={emptyHint}>ยังไม่มีหัวข้อ — กด “เพิ่ม”</p>}
            </div>
          </div>

          {/* FAQ */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ ...cardH, margin: 0 }}>คำถามที่พบบ่อย (FAQ)</h2>
              <button onClick={addFaq} style={addBtn}><IconPlus size={14} color="var(--teal-700)" /> เพิ่ม</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {faq.map((f, i) => (
                <div key={i} style={rowBox}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={f.q} onChange={(e) => upFaq(i, { q: e.target.value })} style={{ ...inp, flex: 1 }} placeholder="คำถาม" onFocus={foc} onBlur={blr} />
                    <button onClick={() => rmFaq(i)} style={rmBtn}><IconTrash size={13} color="#EF4444" /></button>
                  </div>
                  <textarea value={f.a} onChange={(e) => upFaq(i, { a: e.target.value })} rows={2} style={{ ...ta, marginTop: 10 }} placeholder="คำตอบ" onFocus={foc} onBlur={blr} />
                </div>
              ))}
              {faq.length === 0 && <p style={emptyHint}>ยังไม่มี FAQ — กด “เพิ่ม”</p>}
            </div>
          </div>

          {/* บทสรุป */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <label style={lbl}>บทสรุป / คำตัดสิน</label>
            <textarea value={verdict} onChange={(e) => setVerdict(e.target.value)} rows={3} style={ta} placeholder="สรุปว่าตัวไหนคุ้มสุด เหมาะกับใคร" onFocus={foc} onBlur={blr} />
          </div>
        </div>

        {/* แถบขวา — เผยแพร่ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 20 }}>
          <div className="card" style={{ padding: "20px" }}>
            <h2 style={{ ...cardH, margin: "0 0 14px" }}>การเผยแพร่</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>ผู้เขียน</label>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} style={inp} onFocus={foc} onBlur={blr} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>ตำแหน่งผู้เขียน</label>
              <input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} style={inp} onFocus={foc} onBlur={blr} />
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
            {saved ? <><IconCheck size={16} color="#fff" /> บันทึกแล้ว</> : saving ? "กำลังบันทึก…" : isEdit ? "บันทึก" : "สร้างรีวิว"}
          </button>

          {isEdit && (
            <button onClick={deleteReview} style={{ background: "none", border: "1px solid #FECACA", borderRadius: "var(--radius-full)", padding: "11px 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <IconTrash size={14} color="#EF4444" /> ลบรีวิว
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6 };
const cardH: React.CSSProperties = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", margin: "0 0 4px" };
const inp: React.CSSProperties = { width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" };
const ta: React.CSSProperties = { width: "100%", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "10px 14px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", lineHeight: 1.6 };
const rowBox: React.CSSProperties = { border: "1px solid var(--neutral-150, #e5e7eb)", borderRadius: "var(--radius-md)", padding: "14px", background: "var(--neutral-50)" };
const addBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, background: "var(--teal-50)", color: "var(--teal-700)", border: "1px solid var(--teal-200)", borderRadius: "var(--radius-full)", padding: "6px 14px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, cursor: "pointer" };
const rmBtn: React.CSSProperties = { background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 10px", cursor: "pointer", flexShrink: 0 };
const emptyHint: React.CSSProperties = { fontSize: 13, color: "var(--neutral-400)", textAlign: "center", padding: "16px 0" };
const foc = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = "var(--teal-600)"; };
const blr = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = "var(--neutral-200)"; };
