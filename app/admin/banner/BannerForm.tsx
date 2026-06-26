"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconUpload, IconImage, IconTrash, IconLeaf } from "@/components/icons";
import Image from "next/image";

export interface BannerData {
  id?: string;
  title: string; accent: string; subtitle: string; image: string | null;
  cta_primary: string; cta_primary_href: string;
  cta_secondary: string; cta_secondary_href: string;
  is_active: boolean; sort_order: number;
}

export interface BannerProduct { id: string; name: string; slug: string }

async function revalidate() {
  await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["banners"] }) }).catch(() => {});
}

export default function BannerForm({ banner, products = [] }: { banner?: BannerData; products?: BannerProduct[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!banner?.id;

  const [title, setTitle] = useState(banner?.title ?? "สุขภาพดี");
  const [accent, setAccent] = useState(banner?.accent ?? "เริ่มต้นที่นี่");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [ctaPrimary, setCtaPrimary] = useState(banner?.cta_primary ?? "เลือกสินค้า");
  const [ctaPrimaryHref, setCtaPrimaryHref] = useState(banner?.cta_primary_href ?? "/products");
  const [ctaSecondary, setCtaSecondary] = useState(banner?.cta_secondary ?? "บทความสุขภาพ");
  const [ctaSecondaryHref, setCtaSecondaryHref] = useState(banner?.cta_secondary_href ?? "/articles");
  const [image, setImage] = useState(banner?.image ?? "");
  const [isActive, setIsActive] = useState(banner?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(String(banner?.sort_order ?? 0));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file: File) {
    setUploading(true); setError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `banners/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (upErr) { setError("อัปโหลดรูปไม่สำเร็จ"); setUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImage(data.publicUrl);
    setUploading(false);
  }

  async function save() {
    setSaving(true); setError("");
    const supabase = createClient();
    const payload = {
      title, accent, subtitle, image: image || null,
      cta_primary: ctaPrimary, cta_primary_href: ctaPrimaryHref,
      cta_secondary: ctaSecondary, cta_secondary_href: ctaSecondaryHref,
      is_active: isActive, sort_order: parseInt(sortOrder) || 0,
    };
    const { error: e } = isEdit
      ? await supabase.from("banners").update(payload).eq("id", banner!.id!)
      : await supabase.from("banners").insert(payload);
    if (e) { setError(e.message); setSaving(false); return; }
    await revalidate();
    setSaving(false); setSaved(true);
    setTimeout(() => router.push("/admin/banner"), 800);
  }

  const inp = { width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", background: "#fff" } as React.CSSProperties;
  const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6 };
  const foc = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const wrap = e.target.closest("[data-input-wrap]") as HTMLElement | null;
    if (wrap) wrap.style.borderColor = "var(--teal-600)";
    else e.target.style.borderColor = "var(--teal-600)";
  };
  const blr = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const wrap = e.target.closest("[data-input-wrap]") as HTMLElement | null;
    if (wrap) wrap.style.borderColor = "var(--neutral-200)";
    else e.target.style.borderColor = "var(--neutral-200)";
  };
  const inputWrap: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 14px", background: "#fff", transition: "border-color .15s" };
  const inpInner: React.CSSProperties = { flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "var(--font-body)", background: "transparent", color: "var(--neutral-900)", minWidth: 0 };

  return (
    <div style={{ maxWidth: 940 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <a href="/admin/banner" style={{ fontSize: 13, color: "var(--neutral-400)", textDecoration: "none" }}>← แบนเนอร์</a>
        <span style={{ color: "var(--neutral-200)" }}>/</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)", margin: 0 }}>{isEdit ? "แก้ไขแบนเนอร์" : "เพิ่มแบนเนอร์"}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", margin: 0 }}>ข้อความ</h2>
            <div><label style={lbl}>หัวข้อหลัก (บรรทัดแรก)</label><input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} onFocus={foc} onBlur={blr} /></div>
            <div><label style={lbl}>ข้อความเน้นสี (บรรทัดสอง)</label><input value={accent} onChange={(e) => setAccent(e.target.value)} style={inp} onFocus={foc} onBlur={blr} /></div>
            <div><label style={lbl}>คำอธิบาย</label><textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} style={{ ...inp, height: "auto", padding: "10px 14px", resize: "vertical" }} onFocus={foc} onBlur={blr} /></div>
          </div>

          <div className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", margin: 0 }}>ปุ่ม CTA</h2>

            {/* ปุ่มหลัก */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>ข้อความปุ่มหลัก</label>
                <div style={inputWrap} data-input-wrap>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                  <input value={ctaPrimary} onChange={(e) => setCtaPrimary(e.target.value)} style={inpInner} placeholder="เลือกสินค้า" onFocus={foc} onBlur={blr} />
                </div>
              </div>
              <div>
                <label style={lbl}>ลิงก์ปุ่มหลัก</label>
                <div style={inputWrap} data-input-wrap>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  <input value={ctaPrimaryHref} onChange={(e) => setCtaPrimaryHref(e.target.value)} style={inpInner} placeholder="/products" onFocus={foc} onBlur={blr} />
                </div>
              </div>
            </div>

            {/* ปุ่มรอง */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>ข้อความปุ่มรอง</label>
                <div style={inputWrap} data-input-wrap>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                  <input value={ctaSecondary} onChange={(e) => setCtaSecondary(e.target.value)} style={inpInner} placeholder="บทความสุขภาพ" onFocus={foc} onBlur={blr} />
                </div>
              </div>
              <div>
                <label style={lbl}>ลิงก์ปุ่มรอง</label>
                <div style={inputWrap} data-input-wrap>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  <input value={ctaSecondaryHref} onChange={(e) => setCtaSecondaryHref(e.target.value)} style={inpInner} placeholder="/articles" onFocus={foc} onBlur={blr} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["/products", "/articles", "/reviews", "/qa"].map((hint) => (
                <span key={hint} style={{ fontSize: 11, color: "var(--teal-600)", background: "var(--teal-50)", border: "1px solid var(--teal-100)", borderRadius: "var(--radius-full)", padding: "2px 10px", fontFamily: "monospace", cursor: "default" }}>{hint}</span>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: "20px 24px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 12 }}>รูปแบนเนอร์ (ฝั่งขวา)</h2>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
            {image ? (
              <div style={{ position: "relative" }}>
                <Image src={image} alt="banner" width={520} height={240} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 10, display: "block" }} />
                <button onClick={() => setImage("")} style={{ position: "absolute", top: 8, right: 8, background: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.15)" }}><IconTrash size={14} color="#EF4444" /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: "100%", height: 150, border: "2px dashed var(--neutral-200)", borderRadius: 10, background: "var(--neutral-50)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--neutral-400)" }}>
                {uploading ? <IconImage size={26} color="var(--teal-400)" /> : <IconUpload size={26} color="currentColor" />}
                <span style={{ fontSize: 13 }}>{uploading ? "กำลังอัปโหลด…" : "คลิกเพื่ออัปโหลด (ไม่ใส่ = แสดงขวดจำลอง)"}</span>
              </button>
            )}
          </div>

          {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>{error}</div>}
          <button onClick={save} disabled={saving} style={{ alignSelf: "flex-start", background: saved ? "var(--teal-700)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "12px 30px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {saved ? <><IconCheck size={16} color="#fff" /> บันทึกแล้ว</> : saving ? "กำลังบันทึก…" : isEdit ? "บันทึก" : "เพิ่มแบนเนอร์"}
          </button>
        </div>

        {/* ตั้งค่า + พรีวิว */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontSize: 14, color: "var(--neutral-700)", fontWeight: 600 }}>เปิดใช้งาน</span>
              <div onClick={() => setIsActive((v) => !v)} style={{ width: 44, height: 24, borderRadius: 12, background: isActive ? "var(--teal-500)" : "var(--neutral-200)", position: "relative", cursor: "pointer", transition: "background .2s" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: isActive ? 22 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
              </div>
            </label>
            <div><label style={lbl}>ลำดับการแสดง (น้อย = ก่อน)</label><input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={inp} /></div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <p style={{ margin: 0, padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", borderBottom: "1px solid var(--neutral-100)" }}>ตัวอย่าง</p>
            <div style={{ background: "var(--gradient-hero)", padding: "22px 18px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff", color: "var(--teal-700)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10, padding: "4px 10px", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-sm)", marginBottom: 12 }}>
                <IconLeaf size={11} color="var(--teal-600)" /> สินค้าคุณภาพสูง
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, lineHeight: 1.2, color: "var(--neutral-900)", margin: "0 0 8px" }}>
                {title || "สุขภาพดี"}<br /><span style={{ color: "var(--teal-600)" }}>{accent || "เริ่มต้นที่นี่"}</span>
              </h3>
              <p style={{ fontSize: 12, color: "var(--neutral-600)", lineHeight: 1.6, margin: "0 0 12px" }}>{subtitle || "คำอธิบายแบนเนอร์…"}</p>
              {image && <Image src={image} alt="preview" width={300} height={110} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 10, marginBottom: 12 }} />}
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "7px 14px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12 }}>{ctaPrimary || "เลือกสินค้า"}</span>
                <span style={{ border: "1.5px solid var(--teal-600)", color: "var(--teal-700)", borderRadius: "var(--radius-full)", padding: "6px 12px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12 }}>{ctaSecondary || "บทความ"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
