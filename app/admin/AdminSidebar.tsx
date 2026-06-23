"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBarChart, IconPackage, IconTag, IconTruck, IconSettings, IconPlus, IconUser, IconEdit } from "@/components/icons";

const NAV = [
  { href: "/admin",           label: "แดชบอร์ด",   icon: <IconBarChart size={18} color="currentColor" /> },
  { href: "/admin/orders",    label: "ออเดอร์",      icon: <IconTruck size={18} color="currentColor" /> },
  { href: "/admin/products",  label: "สินค้า",       icon: <IconPackage size={18} color="currentColor" /> },
  { href: "/admin/coupons",   label: "คูปอง",        icon: <IconTag size={18} color="currentColor" /> },
  { href: "/admin/articles",  label: "บทความ",       icon: <IconEdit size={18} color="currentColor" /> },
  { href: "/admin/reports",   label: "รายงาน",       icon: <IconBarChart size={18} color="currentColor" /> },
  { href: "/admin/settings",  label: "ตั้งค่าเว็บ",  icon: <IconSettings size={18} color="currentColor" /> },
];

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <aside style={{ width: 220, background: "#fff", borderRight: "1px solid var(--neutral-100)", padding: "24px 0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--neutral-100)" }}>
        <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--teal-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconPlus size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--neutral-900)" }}>Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const active = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: "var(--radius-md)", textDecoration: "none",
              background: active ? "var(--teal-50)" : "transparent",
              color: active ? "var(--teal-700)" : "var(--neutral-600)",
              fontFamily: "var(--font-display)", fontWeight: active ? 700 : 500, fontSize: 14,
              transition: "all .15s",
            }}>
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "16px 10px", borderTop: "1px solid var(--neutral-100)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--radius-md)", textDecoration: "none", color: "var(--neutral-500)", fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 500 }}>
          <IconUser size={16} color="currentColor" /> ดูหน้าร้าน
        </Link>
      </div>
    </aside>
  );
}
