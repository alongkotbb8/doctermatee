// แปลง object เป็น JSON-LD string ที่ปลอดภัยสำหรับฝังใน <script>
// escape "<" เป็น < เพื่อกัน </script> breakout
export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

// สร้าง BreadcrumbList JSON-LD สำหรับทุกหน้า
// items: [{ name, url }] ตามลำดับ เช่น [{name:"หน้าแรก",url:"/"},{name:"สินค้า",url:"/products"},{name:"ชื่อสินค้า",url:"/products/slug"}]
export function breadcrumbLd(siteUrl: string, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}
