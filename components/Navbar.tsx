"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { IconSearch, IconUser, IconMenu, IconStethoscope, IconX } from "./icons";
import CartIcon from "./CartIcon";
import Logo from "./Logo";

const LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้า" },
  { href: "/articles", label: "บทความ" },
  { href: "/about", label: "เกี่ยวกับเรา" },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");

  // ปิดเมนูเมื่อเปลี่ยนหน้า
  useEffect(() => { setOpen(false); }, [path]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    setOpen(false);
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
  }

  // liquid glass เมื่อเลื่อนหน้าลง
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 40,
        background: scrolled ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.9)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        backdropFilter: "saturate(180%) blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(13,148,136,0.12)" : "1px solid var(--neutral-100)",
        boxShadow: scrolled ? "0 8px 30px -14px rgba(13,148,136,0.25)" : "none",
        transition: "background .25s var(--ease), box-shadow .25s var(--ease), border-color .25s var(--ease)",
      }}
    >
      <div className="wrap nav-bar" style={{ display: "flex", alignItems: "center", gap: 16, height: 68 }}>

        {/* ซ้าย: hamburger + logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button className="nav-hamburger" onClick={() => setOpen((o) => !o)} aria-label="เมนู"
            style={{ display: "none", width: 40, height: 40, border: "none", background: "var(--neutral-50)", borderRadius: 10, cursor: "pointer", alignItems: "center", justifyContent: "center", color: "var(--neutral-700)", flexShrink: 0 }}>
            {open ? <IconX size={20} color="currentColor" /> : <IconMenu size={20} color="currentColor" />}
          </button>
          <Logo size={40} iconOnly />
        </div>

        {/* กลาง: เมนู + ช่องค้นหา */}
        <div className="nav-center" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, minWidth: 0 }}>
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
          <form className="nav-search" onSubmit={submitSearch} style={{ display: "flex", alignItems: "center", background: "var(--neutral-50)", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-full)", padding: "0 6px 0 16px", height: 42, width: 320, maxWidth: "36%", minWidth: 0 }}>
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาสินค้า…" style={{ flex: 1, minWidth: 0, border: "none", background: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--neutral-900)" }} />
            <button type="submit" aria-label="ค้นหา" style={{ width: 32, height: 32, border: "none", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconSearch size={15} color="#fff" />
            </button>
          </form>
        </div>

        {/* ขวา: บัญชี + ตะกร้า + ปรึกษาแพทย์ */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <Link href="/account" className="icon-btn" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: "var(--neutral-700)", fontSize: 10, textDecoration: "none" }}>
            <IconUser size={22} color="var(--neutral-700)" />บัญชี
          </Link>
          <CartIcon />
          <Link href="/contact" className="nav-consult" style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--green-50)", border: "1px solid var(--teal-100)", borderRadius: "var(--radius-full)", padding: "8px 16px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--teal-700)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
            <IconStethoscope size={18} color="var(--teal-700)" /> ปรึกษาแพทย์
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="nav-drawer anim-fade-up" style={{ borderTop: "1px solid var(--neutral-100)", background: "#fff", padding: "12px 24px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
          <form onSubmit={submitSearch} style={{ display: "flex", alignItems: "center", background: "var(--neutral-50)", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-full)", padding: "0 6px 0 16px", height: 44, marginBottom: 8 }}>
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาสินค้า…" style={{ flex: 1, minWidth: 0, border: "none", background: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 14 }} />
            <button type="submit" aria-label="ค้นหา" style={{ width: 32, height: 32, border: "none", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconSearch size={15} color="#fff" />
            </button>
          </form>
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
    </header>
  );
}
