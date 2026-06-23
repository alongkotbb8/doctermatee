"use client";

import Link from "next/link";
import { IconPill, IconFlask, IconSparkles, IconBaby, IconHeartPulse } from "./icons";

const ICONS: Record<string, React.ReactNode> = {
  pill:       <IconPill size={26} color="var(--teal-600)" />,
  flask:      <IconFlask size={26} color="var(--teal-600)" />,
  sparkles:   <IconSparkles size={26} color="var(--teal-600)" />,
  baby:       <IconBaby size={26} color="var(--teal-600)" />,
  heartpulse: <IconHeartPulse size={26} color="var(--teal-600)" />,
};

interface Props {
  href: string;
  iconKey: string;
  name: string;
}

export default function CategoryCard({ href, iconKey, name }: Props) {
  return (
    <Link href={href} className="cat-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "22px 12px", border: "1px solid var(--neutral-100)", borderRadius: "var(--radius-md)", textDecoration: "none", color: "inherit", transition: ".2s var(--ease)" }}>
      <span className="cat-icon" style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--green-50)", color: "var(--teal-600)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s var(--ease)" }}>
        {ICONS[iconKey] ?? <IconPill size={26} color="var(--teal-600)" />}
      </span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--neutral-700)", textAlign: "center" }}>{name}</span>
    </Link>
  );
}
