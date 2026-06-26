"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { IconLeaf, IconShield, IconTag, IconPill } from "./icons";
import type { Banner } from "@/lib/data";

const TRUST = [
  { icon: <IconShield size={14} color="var(--teal-600)" />, text: "ของแท้ มีเลข อย." },
  { icon: <IconLeaf size={14} color="var(--teal-600)" />, text: "ส่งฟรีครบ ฿500" },
  { icon: <IconTag size={14} color="var(--teal-600)" />, text: "ราคาดีที่สุด" },
];

function BottleMock() {
  return (
    <div className="anim-float" style={{ position: "relative", width: 200 }}>
      <div style={{ width: 118, height: 42, background: "var(--teal-800)", borderRadius: "12px 12px 6px 6px", margin: "0 auto", zIndex: 2, position: "relative" }} />
      <div style={{ width: 104, height: 14, background: "var(--teal-700)", margin: "-2px auto 0", borderRadius: "0 0 6px 6px" }} />
      <div style={{ width: 200, height: 248, background: "linear-gradient(160deg,#fff 0%,#E1F5EE 100%)", borderRadius: 28, boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 18, textAlign: "center", border: "1px solid #CFFAEE" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, lineHeight: 1.15, color: "var(--teal-700)", letterSpacing: "-.02em", textTransform: "uppercase" }}>
          Doctermatee<br />Health
        </span>
        <span style={{ fontSize: 10, color: "var(--teal-500)", marginTop: 10, letterSpacing: ".07em" }}>PREMIUM SUPPLEMENT</span>
      </div>
    </div>
  );
}

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const len = banners.length;
  const pausedRef = useRef(false);

  useEffect(() => {
    if (len <= 1) return;
    const t = setInterval(() => {
      if (!pausedRef.current) setI((p) => (p + 1) % len);
    }, 6500);
    return () => clearInterval(t);
  }, [len]);

  if (len === 0) return null;
  const b = banners[i];

  return (
    <section
      style={{ background: "var(--gradient-hero)", overflow: "hidden", position: "relative" }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {b.bg_image && (
        <Image
          src={b.bg_image}
          alt=""
          fill
          priority
          style={{ objectFit: "cover", opacity: 0.18, zIndex: 0 }}
          sizes="100vw"
        />
      )}
      <div className="wrap grid-12" style={{ alignItems: "center", gap: 48, paddingTop: 60, paddingBottom: len > 1 ? 80 : 68, position: "relative", zIndex: 1 }}>
        {/* Left copy */}
        <div className="col-7" key={`copy-${i}`} style={{ animation: "heroInLeft 1.1s cubic-bezier(.22,.61,.36,1) both" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "var(--teal-700)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, padding: "6px 14px", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-sm)", marginBottom: 20 }}>
            <IconLeaf size={13} color="var(--teal-600)" /> สินค้าคุณภาพสูง มีเลข อย.
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.15, letterSpacing: "-.025em", color: "var(--neutral-900)", marginBottom: 14 }}>
            {b.title ?? "สุขภาพดี"}<br />
            <span style={{ color: "var(--teal-600)" }}>{b.accent ?? "เริ่มต้นที่นี่"}</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--neutral-600)", maxWidth: 440, marginBottom: 28, lineHeight: 1.75 }}>
            {b.subtitle ?? "อาหารเสริม วิตามิน และผลิตภัณฑ์ดูแลสุขภาพคุณภาพสูง พร้อมคำแนะนำจากแพทย์ผู้เชี่ยวชาญ"}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
            <Link href={b.cta_primary_href || "/products"} className="btn-pop" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "12px 24px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              {b.cta_primary || "เลือกสินค้า"}
            </Link>
            <Link href={b.cta_secondary_href || "/articles"} className="btn-pop" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: "var(--teal-700)", border: "1.5px solid var(--teal-600)", borderRadius: "var(--radius-full)", padding: "11px 22px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              {b.cta_secondary || "บทความสุขภาพ"}
            </Link>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {TRUST.map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--neutral-500)", fontWeight: 500 }}>
                {icon}{text}
              </div>
            ))}
          </div>
        </div>

        {/* Right visual */}
        <div className="col-5" key={`vis-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 340, position: "relative", animation: "heroInRight .95s cubic-bezier(.22,.61,.36,1) both" }}>
          {b.image ? (
            <Image src={b.image} alt={b.title ?? "banner"} width={600} height={380} style={{ width: "100%", maxHeight: 380, objectFit: "contain", borderRadius: "var(--radius-lg)" }} priority />
          ) : (
            <BottleMock />
          )}
        </div>
      </div>

      {/* Dots + arrows */}
      {len > 1 && (
        <>
          <div style={{ position: "absolute", bottom: 26, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 8, zIndex: 4 }}>
            {banners.map((_, idx) => (
              <button key={idx} aria-label={`สไลด์ ${idx + 1}`} onClick={() => setI(idx)}
                style={{ width: idx === i ? 26 : 9, height: 9, borderRadius: 5, border: "none", cursor: "pointer", padding: 0, background: idx === i ? "var(--teal-600)" : "rgba(13,148,136,.3)", transition: "all .3s var(--ease)" }} />
            ))}
          </div>
          {[["‹", () => setI((p) => (p - 1 + len) % len), "left"], ["›", () => setI((p) => (p + 1) % len), "right"]].map(([ch, fn, side]) => (
            <button key={side as string} aria-label={side === "left" ? "ก่อนหน้า" : "ถัดไป"} onClick={fn as () => void}
              className="hero-arrow"
              style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [side as string]: 12, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.85)", boxShadow: "var(--shadow-sm)", cursor: "pointer", fontSize: 24, lineHeight: 1, color: "var(--teal-700)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4 }}>
              {ch as string}
            </button>
          ))}
        </>
      )}

      <style>{`
        @keyframes heroInLeft { from { opacity: 0; transform: translateX(-48px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes heroInRight { from { opacity: 0; transform: translateX(48px); } to { opacity: 1; transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) {
          [style*="heroInLeft"], [style*="heroInRight"] { animation: none !important; }
        }
        @media (max-width: 600px){ .hero-arrow{ display:none !important } }
      `}</style>
    </section>
  );
}
