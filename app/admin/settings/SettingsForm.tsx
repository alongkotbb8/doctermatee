"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconPhone, IconTruck } from "@/components/icons";

interface Props {
  contact: { phone?: string; email?: string; hours?: string };
  shipping: { free_threshold?: number; standard_fee?: number };
}

export default function SettingsForm({ contact, shipping }: Props) {
  const router = useRouter();

  const [phone, setPhone] = useState(contact.phone ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [hours, setHours] = useState(contact.hours ?? "");
  const [freeThreshold, setFreeThreshold] = useState(String(shipping.free_threshold ?? 500));
  const [standardFee, setStandardFee] = useState(String(shipping.standard_fee ?? 50));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true); setError("");
    const supabase = createClient();
    const rows = [
      { key: "contact", value: { phone, email, hours } },
      { key: "shipping", value: { free_threshold: parseInt(freeThreshold) || 0, standard_fee: parseInt(standardFee) || 0 } },
    ];
    const { error: e } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (e) { setError(e.message); setSaving(false); return; }
    await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["settings", "catalog"] }) }).catch(() => {});
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const inp = { width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 14px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", background: "#fff" } as React.CSSProperties;
  const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6 };
  const card: React.CSSProperties = { padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 };
  const head = (icon: React.ReactNode, t: string) => (
    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>{icon} {t}</h2>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", marginBottom: 24 }}>ตั้งค่าเว็บ</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="card" style={card}>
          {head(<IconPhone size={17} color="var(--teal-600)" />, "ข้อมูลติดต่อ")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={lbl}>เบอร์โทร</label><input value={phone} onChange={(e) => setPhone(e.target.value)} style={inp} placeholder="02-123-4567" /></div>
            <div><label style={lbl}>อีเมล</label><input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="hello@doctermatee.co.th" /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>เวลาทำการ</label><input value={hours} onChange={(e) => setHours(e.target.value)} style={inp} placeholder="ทุกวัน 8:00–20:00" /></div>
          </div>
        </div>

        <div className="card" style={card}>
          {head(<IconTruck size={17} color="var(--teal-600)" />, "การจัดส่ง")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={lbl}>ส่งฟรีเมื่อซื้อครบ (฿)</label><input type="number" value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>ค่าจัดส่งมาตรฐาน (฿)</label><input type="number" value={standardFee} onChange={(e) => setStandardFee(e.target.value)} style={inp} /></div>
          </div>
          <p style={{ fontSize: 12, color: "var(--neutral-400)", margin: 0 }}>ค่านี้มีผลกับหน้าตะกร้าและหน้าชำระเงินทันทีหลังบันทึก</p>
        </div>

        <div className="card" style={{ ...card, gap: 6 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--neutral-600)" }}>แก้ข้อความและรูปแบนเนอร์หน้าแรกได้ที่เมนู <strong>“แบนเนอร์หลัก”</strong></p>
        </div>

        {error &&<div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>{error}</div>}

        <button onClick={save} disabled={saving} style={{ alignSelf: "flex-start", background: saved ? "var(--teal-700)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "12px 30px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          {saved ? <><IconCheck size={16} color="#fff" /> บันทึกแล้ว</> : saving ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}
        </button>
      </div>
    </div>
  );
}
