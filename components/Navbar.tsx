"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSearch, IconUser, IconMenu, IconStethoscope, IconPlus } from "./icons";
import CartIcon from "./CartIcon";

export default function Navbar() {
  const path = usePathname();

  return (
    <>
      {/* Top bar */}
      <div className="nav-topbar" style={{ background: "var(--teal-800)", color: "#CFFAEE", fontSize: 13 }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 38, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <IconSearch size={13} color="#CFFAEE" /> 02-123-4567
            </span>
            <Link href="/about" style={{ color: "#CFFAEE" }}>เกี่ยวกับเรา</Link>
          </div>
          <span style={{ color: "#fff", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
            <IconTruck16 /> จัดส่งฟรีเมื่อสั่งซื้อครบ ฿500
          </span>
          <div style={{ display: "flex", gap: 18 }}>
            <Link href="/faq" style={{ color: "#CFFAEE" }}>คำถามที่พบบ่อย</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid var(--neutral-100)" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 24, height: 74 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)", letterSpacing: "-0.02em", textDecoration: "none" }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconPlus size={20} color="#fff" />
            </span>
            Doctermatee
          </Link>

          <div className="nav-search" style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--neutral-50)", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-full)", padding: "0 8px 0 18px", height: 46, maxWidth: 520 }}>
            <input type="text" placeholder="ค้นหาวิตามิน อาหารเสริม หรือยา…" style={{ flex: 1, border: "none", background: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--neutral-900)" }} />
            <button style={{ width: 34, height: 34, border: "none", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconSearch size={16} color="#fff" />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/account" className="icon-btn" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--neutral-700)", fontSize: 11, textDecoration: "none" }}>
              <IconUser size={22} color="var(--neutral-700)" />บัญชี
            </Link>
            <CartIcon />
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="nav-menu" style={{ background: "#fff", borderBottom: "1px solid var(--neutral-100)", position: "sticky", top: 0, zIndex: 30 }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 8, height: 52 }}>
          <Link href="/products" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, padding: "10px 18px", borderRadius: "var(--radius-full)", textDecoration: "none" }}>
            <IconMenu size={16} color="#fff" /> หมวดหมู่สินค้า
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
            {[
              { href: "/", label: "หน้าแรก" },
              { href: "/products", label: "สินค้า" },
              { href: "/articles", label: "บทความ" },
              { href: "/about", label: "เกี่ยวกับเรา" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="nav-link" style={{
                fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15,
                color: path === l.href ? "var(--teal-700)" : "var(--neutral-700)",
                padding: "8px 14px", borderRadius: "var(--radius-full)",
                background: path === l.href ? "var(--green-50)" : "transparent",
                textDecoration: "none",
              }}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/contact" className="nav-consult" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--teal-700)", textDecoration: "none", paddingRight: 4 }}>
            <IconStethoscope size={18} color="var(--teal-700)" /> ปรึกษาแพทย์
          </Link>
        </div>
      </nav>

      <style>{`.wrap{max-width:1180px;margin:0 auto;padding:0 24px}`}</style>
    </>
  );
}

function IconTruck16() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
      <rect x="9" y="11" width="14" height="10" rx="2" />
      <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    </svg>
  );
}
