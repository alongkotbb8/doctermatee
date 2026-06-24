"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** เผยอิลิเมนต์ที่มี class "reveal" เมื่อถูกเลื่อนเข้ามาในจอ (เพิ่ม class "reveal-in")
 *  ทำงานทั้งตอนโหลดและตอนเปลี่ยนหน้าแบบ client-side */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.reveal-in)"));
    if (els.length === 0) return;

    // เบราว์เซอร์เก่าไม่รองรับ IntersectionObserver → เผยทันที
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
