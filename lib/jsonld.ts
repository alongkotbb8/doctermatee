// แปลง object เป็น JSON-LD string ที่ปลอดภัยสำหรับฝังใน <script>
// escape "<" เป็น < เพื่อกัน </script> breakout (stored XSS ผ่านฟิลด์ที่แอดมิน/ผู้ใช้กรอก)
export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}
