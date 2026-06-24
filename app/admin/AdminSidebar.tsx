"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBarChart, IconPackage, IconTag, IconTruck, IconSettings, IconPlus, IconUser, IconEdit, IconArrowRight, IconImage } from "@/components/icons";

const NAV = [
  { href: "/admin",           label: "แดชบอร์ด",   icon: <IconBarChart size={17} color="currentColor" /> },
  { href: "/admin/orders",    label: "ออเดอร์",      icon: <IconTruck size={17} color="currentColor" /> },
  { href: "/admin/products",  label: "สินค้า",       icon: <IconPackage size={17} color="currentColor" /> },
  { href: "/admin/coupons",   label: "คูปอง",        icon: <IconTag size={17} color="currentColor" /> },
  { href: "/admin/articles",  label: "บทความ",       icon: <IconEdit size={17} color="currentColor" /> },
  { href: "/admin/banner",    label: "แบนเนอร์หลัก", icon: <IconImage size={17} color="currentColor" /> },
  { href: "/admin/reports",   label: "รายงาน",       icon: <IconBarChart size={17} color="currentColor" /> },
  { href: "/admin/settings",  label: "ตั้งค่าเว็บ",  icon: <IconSettings size={17} color="currentColor" /> },
];

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <aside className="admin-aside" style={{ width: 230, background: "linear-gradient(180deg,#0F172A 0%,#1E293B 100%)", padding: "0 0 16px", display: "flex", flexDirection: "column", flexShrink: 0 }}>

      {/* Logo */}
      <div className="admin-logo" style={{ padding: "20px 18px 18px", borderBottom: "1px solid rgba(255,255,255,.08)", marginBottom: 8 }}>
        <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,var(--teal-500),var(--teal-700))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(20,184,166,.4)" }}>
            <IconPlus size={17} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#fff" }}>Doctermatee</p>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="admin-nav" style={{ flex: 1, padding: "4px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
        {NAV.map((item) => {
          const active = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 10, textDecoration: "none",
              background: active ? "rgba(20,184,166,.18)" : "transparent",
              color: active ? "#5EEAD4" : "rgba(255,255,255,.55)",
              fontFamily: "var(--font-display)", fontWeight: active ? 700 : 500, fontSize: 13.5,
              transition: "all .15s",
              borderLeft: active ? "3px solid var(--teal-400)" : "3px solid transparent",
            }}
            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.85)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,.06)"; }}
            onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.55)"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; } }}>
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — ดูหน้าร้าน */}
      <div className="admin-bottom" style={{ padding: "10px 10px 0", borderTop: "1px solid rgba(255,255,255,.08)", marginTop: 8 }}>
        <a href="/" target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 8, padding: "11px 14px", borderRadius: 10, textDecoration: "none",
          background: "rgba(20,184,166,.12)", border: "1px solid rgba(20,184,166,.25)",
          color: "#5EEAD4", fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 600,
          transition: "all .15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(20,184,166,.22)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(20,184,166,.12)"; }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconUser size={15} color="currentColor" /> ดูหน้าร้าน
          </span>
          <IconArrowRight size={12} color="currentColor" />
        </a>
      </div>
    </aside>
  );
}
