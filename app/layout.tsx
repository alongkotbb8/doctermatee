import type { Metadata } from "next";
import { Manrope, Anuphan } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctermatee.co.th";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Doctermatee — อาหารเสริมและวิตามินคุณภาพ", template: "%s — Doctermatee" },
  description: "ร้านอาหารเสริม วิตามิน และผลิตภัณฑ์ดูแลสุขภาพออนไลน์ คัดสรรโดยผู้เชี่ยวชาญ จัดส่งฟรีเมื่อซื้อครบ ฿500",
  keywords: ["อาหารเสริม", "วิตามิน", "สุขภาพ", "Doctermatee"],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "Doctermatee",
    title: "Doctermatee — อาหารเสริมและวิตามินคุณภาพ",
    description: "ร้านอาหารเสริม วิตามิน และผลิตภัณฑ์ดูแลสุขภาพออนไลน์ คัดสรรโดยผู้เชี่ยวชาญ",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${manrope.variable} ${anuphan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
