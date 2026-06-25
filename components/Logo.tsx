import Link from "next/link";

interface Props {
  size?: number;       // ความสูงของโลโก้ (px)
  dark?: boolean;      // พื้นหลังเข้ม → ใส่ชิปขาวรองหลังโลโก้ + ตัวอักษรขาว
  href?: string | null; // null = ไม่ห่อด้วยลิงก์
  iconOnly?: boolean;  // แสดงเฉพาะโลโก้ ไม่มีตัวอักษร
}

export default function Logo({ size = 34, dark = false, href = "/", iconOnly = false }: Props) {
  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <span
        style={
          dark
            ? { background: "#fff", borderRadius: 10, padding: "5px 7px", display: "inline-flex", alignItems: "center" }
            : { display: "inline-flex", alignItems: "center" }
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg?v=2" alt="Doctermatee" style={{ height: size, width: "auto", display: "block" }} />
      </span>
      {!iconOnly && (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: Math.round(size * 0.62), letterSpacing: "-0.02em", color: dark ? "#fff" : "var(--neutral-900)" }}>
          Doctermatee
        </span>
      )}
    </span>
  );
  if (href === null) return inner;
  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex", flexShrink: 0 }}>
      {inner}
    </Link>
  );
}
