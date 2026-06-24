"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconUpload, IconImage, IconTrash, IconLeaf, IconShield } from "@/components/icons";
import Image from "next/image";

interface Hero {
  title?: string; accent?: string; subtitle?: string; image?: string;
  cta_primary?: string; cta_secondary?: string;
}

export default function BannerForm({ hero }: { hero: Hero }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(hero.title ?? "สุขภาพดี");
  const [accent, setAccent] = useState(hero.accent ?? "เริ่มต้นที่นี่");
  const [subtitle, setSubtitle] = useState(hero.subtitle ?? "");
  const [ctaPrimary, setCtaPrimary] = useState(hero.cta_primary ?? "เลือกสินค้า");
  const [ctaSecondary, setCtaSecondary] = useState(hero.cta_secondary ?? "บทความสุขภาพ");
  const [image, setImage] = useState(hero.image ?? "");

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
    const value = { title, accent, subtitle, image: image || null, cta_primary: ctaPrimary, cta_secondary: ctaSecondary };
    const { error: e } = await supabase.from("site_settings").upsert({ key: "hero", value }, { onConflict: "key" });
    if (e) { setError(e.message); setSaving(false); return; }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const inp = { width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 14px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", background: "#fff" } as React.CSSProperties;
  const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6 };
  const foc = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = "var(--teal-600)"; };
  const blr = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = "var(--neutral-200)"; };

  return (
    <div style={{ maxWidth: 920 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", marginBottom: 6 }}>แบนเนอร์หลัก (หน้าแรก)</h1>
      <p style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 24 }}>แก้ข้อความและรูปของ Hero บนหน้าแรก — บันทึกแล้วมีผลทันที</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        {/* ฟอร์ม */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", margin: 0 }}>ข้อความ</h2>
            <div>
              <label style={lbl}>หัวข้อหลัก (บรรทัดแรก)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} placeholder="สุขภาพดี" onFocus={foc} onBlur={blr} />
            </div>
            <div>
              <label style={lbl}>ข้อความเน้นสี (บรรทัดสอง)</label>
              <input value={accent} onChange={(e) => setAccent(e.target.value)} style={inp} placeholder="เริ่มต้นที่นี่" onFocus={foc} onBlur={blr} />
            </div>
            <div>
              <label style={lbl}>คำอธิบาย</label>
              <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} style={{ ...inp, height: "auto", padding: "10px 14px", resize: "vertical" }} placeholder="อาหารเสริม วิตามิน…" onFocus={foc} onBlur={blr} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>ปุ่มหลัก</label>
                <input value={ctaPrimary} onChange={(e) => setCtaPrimary(e.target.value)} style={inp} placeholder="เลือกสินค้า" onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={lbl}>ปุ่มรอง</label>
                <input value={ctaSecondary} onChange={(e) => setCtaSecondary(e.target.value)} style={inp} placeholder="บทความสุขภาพ" onFocus={foc} onBlur={blr} />
              </div>
            </div>
          </div>

          {/* รูปแบนเนอร์ */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 6 }}>รูปแบนเนอร์ (ฝั่งขวา)</h2>
            <p style={{ fontSize: 12, color: "var(--neutral-400)", marginBottom: 14 }}>ถ้าไม่ใส่รูป จะแสดงภาพขวดจำลองอัตโนมัติ</p>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
            {image ? (
              <div style={{ position: "relative" }}>
                <Image src={image} alt="banner" width={520} height={260} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 10, display: "block" }} />
                <button onClick={() => setImage("")} style={{ position: "absolute", top: 8, right: 8, background: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.15)" }}>
                  <IconTrash size={14} color="#EF4444" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ width: "100%", height: 160, border: "2px dashed var(--neutral-200)", borderRadius: 10, background: "var(--neutral-50)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--neutral-400)" }}>
                {uploading ? <IconImage size={28} color="var(--teal-400)" /> : <IconUpload size={28} color="currentColor" />}
                <span style={{ fontSize: 13 }}>{uploading ? "กำลังอัปโหลด…" : "คลิกเพื่ออัปโหลดรูป"}</span>
              </button>
            )}
          </div>

          {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>{error}</div>}
          <button onClick={save} disabled={saving} style={{ alignSelf: "flex-start", background: saved ? "var(--teal-700)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "12px 30px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {saved ? <><IconCheck size={16} color="#fff" /> บันทึกแล้ว</> : saving ? "กำลังบันทึก…" : "บันทึกแบนเนอร์"}
          </button>
        </div>

        {/* พรีวิว */}
        <div className="card" style={{ padding: 0, overflow: "hidden", position: "sticky", top: 20 }}>
          <p style={{ margin: 0, padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", borderBottom: "1px solid var(--neutral-100)" }}>ตัวอย่าง</p>
          <div style={{ background: "var(--gradient-hero)", padding: "24px 20px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff", color: "var(--teal-700)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10, padding: "4px 10px", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-sm)", marginBottom: 12 }}>
              <IconLeaf size={11} color="var(--teal-600)" /> สินค้าคุณภาพสูง มีเลข อย.
            </span>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, lineHeight: 1.2, color: "var(--neutral-900)", margin: "0 0 8px" }}>
              {title || "สุขภาพดี"}<br /><span style={{ color: "var(--teal-600)" }}>{accent || "เริ่มต้นที่นี่"}</span>
            </h3>
            <p style={{ fontSize: 12, color: "var(--neutral-600)", lineHeight: 1.6, margin: "0 0 14px" }}>{subtitle || "อาหารเสริม วิตามิน และผลิตภัณฑ์ดูแลสุขภาพคุณภาพสูง"}</p>
            {image && <Image src={image} alt="preview" width={300} height={120} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10, marginBottom: 12 }} />}
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "8px 16px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12 }}>{ctaPrimary || "เลือกสินค้า"}</span>
              <span style={{ border: "1.5px solid var(--teal-600)", color: "var(--teal-700)", borderRadius: "var(--radius-full)", padding: "7px 14px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12 }}>{ctaSecondary || "บทความสุขภาพ"}</span>
            </div>
          </div>
          <p style={{ margin: 0, padding: "10px 16px", fontSize: 11, color: "var(--neutral-400)", display: "flex", alignItems: "center", gap: 5 }}>
            <IconShield size={11} color="var(--neutral-400)" /> มีผลกับหน้าแรกหลังบันทึก
          </p>
        </div>
      </div>
    </div>
  );
}
