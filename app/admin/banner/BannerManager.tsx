"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { IconPlus, IconEdit, IconTrash, IconImage } from "@/components/icons";

interface Banner {
  id: string; title: string | null; subtitle: string | null; image: string | null;
  is_active: boolean; sort_order: number;
}

async function revalidate() {
  await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["banners"] }) }).catch(() => {});
}

export default function BannerManager({ initial }: { initial: Banner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>(initial);

  async function toggle(b: Banner) {
    const supabase = createClient();
    await supabase.from("banners").update({ is_active: !b.is_active }).eq("id", b.id);
    setBanners((list) => list.map((x) => (x.id === b.id ? { ...x, is_active: !x.is_active } : x)));
    await revalidate();
  }

  async function remove(id: string) {
    if (!confirm("ลบแบนเนอร์นี้?")) return;
    const supabase = createClient();
    await supabase.from("banners").delete().eq("id", id);
    setBanners((list) => list.filter((x) => x.id !== id));
    await revalidate();
  }

  async function move(b: Banner, dir: -1 | 1) {
    const sorted = [...banners].sort((a, c) => a.sort_order - c.sort_order);
    const idx = sorted.findIndex((x) => x.id === b.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    const supabase = createClient();
    await Promise.all([
      supabase.from("banners").update({ sort_order: swap.sort_order }).eq("id", b.id),
      supabase.from("banners").update({ sort_order: b.sort_order }).eq("id", swap.id),
    ]);
    setBanners((list) => list.map((x) => x.id === b.id ? { ...x, sort_order: swap.sort_order } : x.id === swap.id ? { ...x, sort_order: b.sort_order } : x));
    await revalidate();
    router.refresh();
  }

  const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", margin: 0 }}>แบนเนอร์หลัก</h1>
        <Link href="/admin/banner/new" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--teal-600)", color: "#fff", textDecoration: "none", borderRadius: "var(--radius-full)", padding: "10px 20px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
          <IconPlus size={16} color="#fff" /> เพิ่มแบนเนอร์
        </Link>
      </div>
      <p style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 24 }}>แบนเนอร์ที่เปิดใช้งานหลายอันจะเล่นสไลด์อัตโนมัติบนหน้าแรก</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map((b, i) => (
          <div key={b.id} className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 16 }}>
            {/* reorder */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button onClick={() => move(b, -1)} disabled={i === 0} style={{ border: "none", background: "var(--neutral-100)", borderRadius: 6, cursor: i === 0 ? "default" : "pointer", width: 26, height: 22, color: "var(--neutral-600)", opacity: i === 0 ? 0.4 : 1 }}>▲</button>
              <button onClick={() => move(b, 1)} disabled={i === sorted.length - 1} style={{ border: "none", background: "var(--neutral-100)", borderRadius: 6, cursor: i === sorted.length - 1 ? "default" : "pointer", width: 26, height: 22, color: "var(--neutral-600)", opacity: i === sorted.length - 1 ? 0.4 : 1 }}>▼</button>
            </div>

            {/* thumb */}
            <div style={{ width: 96, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "linear-gradient(145deg,var(--green-50),var(--teal-50))", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {b.image ? <Image src={b.image} alt={b.title ?? ""} fill style={{ objectFit: "cover" }} sizes="96px" /> : <IconImage size={22} color="var(--teal-300)" />}
            </div>

            {/* info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)", margin: 0 }}>{b.title || "(ไม่มีหัวข้อ)"}</p>
              <p style={{ fontSize: 12.5, color: "var(--neutral-500)", margin: "3px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 420 }}>{b.subtitle}</p>
            </div>

            {/* active toggle */}
            <button onClick={() => toggle(b)} style={{ cursor: "pointer", border: "none", background: b.is_active ? "#D1FAE5" : "#F3F4F6", color: b.is_active ? "#065F46" : "#6B7280", borderRadius: "var(--radius-full)", padding: "5px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
              {b.is_active ? "เปิดใช้งาน" : "ปิด"}
            </button>

            <Link href={`/admin/banner/${b.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--teal-600)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <IconEdit size={14} color="var(--teal-600)" /> แก้ไข
            </Link>
            <button onClick={() => remove(b.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex" }}>
              <IconTrash size={16} color="#EF4444" />
            </button>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="card" style={{ padding: "40px 0", textAlign: "center", color: "var(--neutral-400)", fontSize: 14 }}>
            ยังไม่มีแบนเนอร์ — กด “เพิ่มแบนเนอร์” เพื่อสร้าง
          </div>
        )}
      </div>
    </div>
  );
}
