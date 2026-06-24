"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { IconUser, IconMail, IconPhone, IconShield, IconArrowRight } from "@/components/icons";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "รอดำเนินการ", color: "#92400E", bg: "#FEF3C7" },
  paid:      { label: "ชำระแล้ว",    color: "#065F46", bg: "#D1FAE5" },
  shipped:   { label: "จัดส่งแล้ว",  color: "#1E40AF", bg: "#DBEAFE" },
  cancelled: { label: "ยกเลิก",      color: "#991B1B", bg: "#FEE2E2" },
};

interface Props {
  user: User;
  profile: { full_name: string | null; phone: string | null; default_address: Record<string, string> | null } | null;
  orders: { id: string; order_no: string; status: string; payment_status: string; total: number; created_at: string }[];
}

export default function AccountClient({ user, profile, orders }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "address" | "orders">("profile");
  const [showVerified, setShowVerified] = useState(typeof window !== "undefined" && new URLSearchParams(window.location.search).get("verified") === "1");
  const meta = (user.user_metadata ?? {}) as { full_name?: string; phone?: string };
  const [fullName, setFullName] = useState(profile?.full_name ?? meta.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? meta.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Address fields
  const addr = profile?.default_address ?? {};
  const [address, setAddress] = useState(addr.address ?? "");
  const [district, setDistrict] = useState(addr.district ?? "");
  const [province, setProvince] = useState(addr.province ?? "");
  const [postalCode, setPostalCode] = useState(addr.postal_code ?? "");

  async function saveProfile() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").upsert({ id: user.id, full_name: fullName, phone }, { onConflict: "id" });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function saveAddress() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").upsert({
      id: user.id,
      default_address: { full_name: fullName, phone, address, district, province, postal_code: postalCode },
    }, { onConflict: "id" });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/"); router.refresh();
  }

  const tabs = [
    { key: "profile", label: "โปรไฟล์" },
    { key: "address", label: "ที่อยู่จัดส่ง" },
    { key: "orders",  label: `ออเดอร์ (${orders.length})` },
  ] as const;

  return (
    <div style={{ padding: "36px 0 64px" }}>
      <div className="wrap" style={{ maxWidth: 760 }}>
        {showVerified && (
          <div className="anim-fade-up" style={{ background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 14, color: "#065F46", fontWeight: 600 }}>✓ ยืนยันอีเมลสำเร็จแล้ว ยินดีต้อนรับสู่ Doctermatee!</p>
            <button onClick={() => setShowVerified(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#065F46", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        )}
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,var(--teal-400),var(--teal-700))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconUser size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)" }}>{fullName || "สมาชิก"}</h1>
              <p style={{ fontSize: 13, color: "var(--neutral-500)" }}>{user.email}</p>
            </div>
          </div>
          <button onClick={signOut} style={{ background: "none", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-full)", padding: "8px 18px", fontSize: 13, color: "var(--neutral-600)", cursor: "pointer", fontFamily: "var(--font-body)" }}>
            ออกจากระบบ
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--neutral-100)", marginBottom: 28 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 20px", border: "none", background: "none", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: tab === t.key ? "var(--teal-700)" : "var(--neutral-500)", borderBottom: tab === t.key ? "2px solid var(--teal-600)" : "2px solid transparent", marginBottom: -2, cursor: "pointer", transition: "color .2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="anim-fade-up card" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { label: "ชื่อ-นามสกุล", icon: <IconUser size={15} color="var(--neutral-400)" />, value: fullName, set: setFullName, type: "text", placeholder: "สมชาย ใจดี" },
              { label: "เบอร์โทรศัพท์", icon: <IconPhone size={15} color="var(--neutral-400)" />, value: phone, set: setPhone, type: "tel", placeholder: "08X-XXX-XXXX" },
            ].map(({ label, icon, value, set, type, placeholder }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--neutral-700)", marginBottom: 6 }}>{label}</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>{icon}</span>
                  <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                    style={{ width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", paddingLeft: 36, paddingRight: 14, fontSize: 14, fontFamily: "var(--font-body)", outline: "none" }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; e.target.style.boxShadow = "var(--focus-ring)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--neutral-700)", marginBottom: 6 }}>อีเมล</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><IconMail size={15} color="var(--neutral-300)" /></span>
                <input disabled value={user.email ?? ""} style={{ width: "100%", height: 44, border: "1px solid var(--neutral-100)", borderRadius: "var(--radius-input)", paddingLeft: 36, paddingRight: 14, fontSize: 14, fontFamily: "var(--font-body)", background: "var(--neutral-50)", color: "var(--neutral-400)" }} />
              </div>
              <p style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 4 }}>ไม่สามารถเปลี่ยนอีเมลได้</p>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-pop"
              style={{ alignSelf: "flex-start", background: saved ? "var(--green-700)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "11px 28px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              {saved ? "บันทึกแล้ว ✓" : saving ? "กำลังบันทึก…" : "บันทึก"}
            </button>
          </div>
        )}

        {/* Address tab */}
        {tab === "address" && (
          <div className="anim-fade-up card" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "ที่อยู่", value: address, set: setAddress, placeholder: "บ้านเลขที่ ถนน แขวง/ตำบล" },
              { label: "เขต/อำเภอ", value: district, set: setDistrict, placeholder: "เขต/อำเภอ" },
              { label: "จังหวัด", value: province, set: setProvince, placeholder: "จังหวัด" },
              { label: "รหัสไปรษณีย์", value: postalCode, set: setPostalCode, placeholder: "10110" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--neutral-700)", marginBottom: 6 }}>{label}</label>
                <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                  style={{ width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", paddingLeft: 14, paddingRight: 14, fontSize: 14, fontFamily: "var(--font-body)", outline: "none" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; e.target.style.boxShadow = "var(--focus-ring)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}
            <button onClick={saveAddress} disabled={saving} className="btn-pop"
              style={{ alignSelf: "flex-start", background: saved ? "var(--green-700)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "11px 28px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              {saved ? "บันทึกแล้ว ✓" : saving ? "กำลังบันทึก…" : "บันทึกที่อยู่"}
            </button>
          </div>
        )}

        {/* Orders tab */}
        {tab === "orders" && (
          <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--neutral-500)" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}><IconShield size={40} color="var(--neutral-300)" /></p>
                <p>ยังไม่มีออเดอร์</p>
                <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, color: "var(--teal-600)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                  เลือกสินค้า <IconArrowRight size={14} color="var(--teal-600)" />
                </Link>
              </div>
            ) : orders.map((o) => {
              const s = STATUS_LABEL[o.status] ?? { label: o.status, color: "#374151", bg: "#F3F4F6" };
              return (
                <Link key={o.id} href={`/order/${o.id}`} style={{ textDecoration: "none" }}>
                  <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, transition: "box-shadow .2s, transform .2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = ""; (e.currentTarget as HTMLDivElement).style.transform = ""; }}
                  >
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--neutral-900)" }}>#{o.order_no}</p>
                      <p style={{ fontSize: 12, color: "var(--neutral-500)", marginTop: 2 }}>{new Date(o.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: "var(--radius-full)", padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{s.label}</span>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--teal-600)" }}>฿{o.total.toLocaleString()}</span>
                      <IconArrowRight size={14} color="var(--neutral-400)" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
