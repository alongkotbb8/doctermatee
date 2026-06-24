"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { IconSearch, IconUser, IconMenu, IconStethoscope, IconPlus, IconX } from "./icons";
import CartIcon from "./CartIcon";

const LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้า" },
  { href: "/articles", label: "บทความ" },
  { href: "/about", label: "เกี่ยวกับเรา" },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // ปิดเมนูเมื่อเปลี่ยนหน้า
  useEffect(() => { setOpen(false); }, [path]);

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid var(--neutral-100)", position: "sticky", top: 0, zIndex: 40 }}>
      <div className="wrap nav-bar" style={{ display: "flex", alignItems: "center", gap: 16, height: 68 }}>

        {/* Hamburger (มือถือ) */}
        <button className="nav-hamburger" onClick={() => setOpen((o) => !o)} aria-label="เมนู"
          style={{ display: "none", width: 40, height: 40, border: "none", background: "var(--neutral-50)", borderRadius: 10, cursor: "pointer", alignItems: "center", justifyContent: "center", color: "var(--neutral-700)", flexShrink: 0 }}>
          {open ? <IconX size={20} color="currentColor" /> : <IconMenu size={20} color="currentColor" />}
        </button>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 21, color: "var(--neutral-900)", letterSpacing: "-0.02em", textDecoration: "none", flexShrink: 0 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconPlus size={20} color="#fff" />
          </span>
          Doctermatee
        </Link>

        {/* Nav links (เดสก์ท็อป) */}
        <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" style={{
              fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15,
              color: path === l.href ? "var(--teal-700)" : "var(--neutral-700)",
              padding: "8px 14px", borderRadius: "var(--radius-full)",
              background: path === l.href ? "var(--green-50)" : "transparent",
              textDecoration: "none", whiteSpace: "nowrap",
            }}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="nav-search" style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--neutral-50)", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-full)", padding: "0 6px 0 16px", height: 42, minWidth: 0, maxWidth: 360, marginLeft: "auto" }}>
          <input type="text" placeholder="ค้นหาสินค้า…" style={{ flex: 1, minWidth: 0, border: "none", background: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--neutral-900)" }} />
          <button aria-label="ค้นหา" style={{ width: 32, height: 32, border: "none", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconSearch size={15} color="#fff" />
          </button>
        </div>

        {/* Consult (เดสก์ท็อป) */}
        <Link href="/contact" className="nav-consult" style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--teal-700)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
          <IconStethoscope size={18} color="var(--teal-700)" /> ปรึกษาแพทย์
        </Link>

        {/* Account + Cart */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <Link href="/account" className="icon-btn" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: "var(--neutral-700)", fontSize: 10, textDecoration: "none" }}>
            <IconUser size={22} color="var(--neutral-700)" />บัญชี
          </Link>
          <CartIcon />
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="nav-drawer anim-fade-up" style={{ borderTop: "1px solid var(--neutral-100)", background: "#fff", padding: "12px 24px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", background: "var(--neutral-50)", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-full)", padding: "0 6px 0 16px", height: 44, marginBottom: 8 }}>
            <input type="text" placeholder="ค้นหาสินค้า…" style={{ flex: 1, minWidth: 0, border: "none", background: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 14 }} />
            <button aria-label="ค้นหา" style={{ width: 32, height: 32, border: "none", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconSearch size={15} color="#fff" />
            </button>
          </div>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
              color: path === l.href ? "var(--teal-700)" : "var(--neutral-800)",
              background: path === l.href ? "var(--green-50)" : "transparent",
              padding: "12px 14px", borderRadius: 10, textDecoration: "none",
            }}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--teal-700)", padding: "12px 14px", borderRadius: 10, textDecoration: "none", borderTop: "1px solid var(--neutral-100)", marginTop: 4 }}>
            <IconStethoscope size={18} color="var(--teal-700)" /> ปรึกษาแพทย์
          </Link>
        </div>
      )}

      <style>{`.wrap{max-width:1180px;margin:0 auto;padding:0 24px}`}</style>
    </header>
  );
}
