"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconUpload, IconImage, IconTrash, IconCheck } from "@/components/icons";
import Image from "next/image";

interface Category { id: string; name: string }
interface ProductData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  category_id: string;
  fda_no: string;
  status: "active" | "draft";
  images: string[] | null;
}

interface Props {
  categories: Category[];
  product?: ProductData;
}

function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product?.id;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [compareAt, setCompareAt] = useState(String(product?.compare_at_price ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? ""));
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const [fdaNo, setFdaNo] = useState(product?.fda_no ?? "");
  const [isActive, setIsActive] = useState((product?.status ?? "active") === "active");
  const [imageUrl, setImageUrl] = useState(product?.images?.[0] ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function uploadImage(file: File) {
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (upErr) { setError("อัปโหลดรูปไม่สำเร็จ"); setUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  }

  async function save() {
    if (!name || !slug || !price || !stock || !categoryId) { setError("กรุณากรอกข้อมูลที่จำเป็น"); return; }
    setSaving(true); setError("");
    const supabase = createClient();
    const payload = {
      name, slug, description,
      price: parseFloat(price),
      compare_at_price: compareAt ? parseFloat(compareAt) : null,
      stock: parseInt(stock),
      category_id: categoryId,
      fda_no: fdaNo,
      status: isActive ? "active" : "draft",
      images: imageUrl ? [imageUrl] : [],
    };
    if (isEdit) {
      const { error: e } = await supabase.from("products").update(payload).eq("id", product!.id!);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("products").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["catalog"] }) }).catch(() => {});
    setSaving(false); setSaved(true);
    setTimeout(() => router.push("/admin/products"), 1000);
  }

  async function deleteProduct() {
    if (!confirm("ลบสินค้านี้?")) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", product!.id!);
    await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["catalog"] }) }).catch(() => {});
    router.push("/admin/products");
  }

  const inputStyle = { width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 14px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" };
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = "var(--teal-600)"; };
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = "var(--neutral-200)"; };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <a href="/admin/products" style={{ fontSize: 13, color: "var(--neutral-400)", textDecoration: "none" }}>← สินค้า</a>
        <span style={{ color: "var(--neutral-200)" }}>/</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)", margin: 0 }}>
          {isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Basic info */}
          <div className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", margin: 0 }}>ข้อมูลสินค้า</h2>
            <div>
              <label style={lbl}>ชื่อสินค้า *</label>
              <input value={name} onChange={(e) => { setName(e.target.value); if (!isEdit) setSlug(toSlug(e.target.value)); }}
                style={inputStyle} placeholder="วิตามินซี 1000mg" onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={lbl}>Slug (URL) *</label>
              <input value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} style={inputStyle} placeholder="vitamin-c-1000mg" onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={lbl}>รายละเอียด</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" }}
                placeholder="อธิบายสินค้า ส่วนผสม วิธีรับประทาน..." onFocus={focus} onBlur={blur} />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="card" style={{ padding: "22px 24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={lbl}>ราคาขาย (฿) *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} placeholder="590" onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={lbl}>ราคาเดิม (฿)</label>
              <input type="number" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} style={inputStyle} placeholder="790" onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={lbl}>สต็อก *</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} placeholder="100" onFocus={focus} onBlur={blur} />
            </div>
          </div>

          {/* Category & FDA */}
          <div className="card" style={{ padding: "22px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lbl}>หมวดหมู่ *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                style={{ ...inputStyle, background: "#fff" }} onFocus={focus} onBlur={blur}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>เลข อย.</label>
              <input value={fdaNo} onChange={(e) => setFdaNo(e.target.value)} style={inputStyle} placeholder="10-1-XXXXX-X-XXXX" onFocus={focus} onBlur={blur} />
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Image upload */}
          <div className="card" style={{ padding: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 14 }}>รูปสินค้า</h2>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />

            {imageUrl ? (
              <div style={{ position: "relative" }}>
                <Image src={imageUrl} alt="product" width={260} height={260} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 10, display: "block" }} />
                <button onClick={() => setImageUrl(null)} style={{ position: "absolute", top: 8, right: 8, background: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.15)" }}>
                  <IconTrash size={14} color="#EF4444" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ width: "100%", height: 160, border: "2px dashed var(--neutral-200)", borderRadius: 10, background: "var(--neutral-50)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--neutral-400)", transition: "all .2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--teal-400)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--neutral-200)"; }}>
                {uploading ? <IconImage size={28} color="var(--teal-400)" /> : <IconUpload size={28} color="currentColor" />}
                <span style={{ fontSize: 13 }}>{uploading ? "กำลังอัปโหลด…" : "คลิกเพื่ออัปโหลด"}</span>
              </button>
            )}
          </div>

          {/* Toggles */}
          <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", margin: 0 }}>การแสดงผล</h2>
            {[
              { label: "เผยแพร่", value: isActive, set: setIsActive },
            ].map(({ label, value, set }) => (
              <label key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <span style={{ fontSize: 14, color: "var(--neutral-700)" }}>{label}</span>
                <div onClick={() => set(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? "var(--teal-500)" : "var(--neutral-200)", position: "relative", transition: "background .2s", cursor: "pointer", flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: value ? 22 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                </div>
              </label>
            ))}
          </div>

          {/* Save */}
          {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>{error}</div>}
          <button onClick={save} disabled={saving} style={{ background: saved ? "var(--teal-700)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "13px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {saved ? <><IconCheck size={16} color="#fff" /> บันทึกแล้ว</> : saving ? "กำลังบันทึก…" : isEdit ? "บันทึก" : "เพิ่มสินค้า"}
          </button>
          {isEdit && (
            <button onClick={deleteProduct} style={{ background: "none", border: "1px solid #FECACA", borderRadius: "var(--radius-full)", padding: "11px 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <IconTrash size={14} color="#EF4444" /> ลบสินค้า
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6 };
