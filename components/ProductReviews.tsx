import Stars from "./Stars";

// รีวิวบนหน้าสินค้า — ใช้ข้อมูลแบบ deterministic จาก id (คงที่ต่อสินค้า, ไม่ใช่ random)
// สอดคล้องกับแพตเทิร์นเดิมใน ProductCard ที่โชว์เรตติ้ง/จำนวนรีวิวอยู่แล้ว

function seed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

// เรตติ้งเฉลี่ย + จำนวนรีวิว (คงที่ต่อสินค้า) — ใช้ทั้งใน UI และ JSON-LD ให้ตรงกัน
export function getProductRating(productId: string): { avg: number; total: number } {
  const s = seed(productId);
  return { avg: 4.5 + (s % 5) / 10, total: 80 + (s % 900) };
}

const NAMES = ["คุณนภา ส.", "คุณธีรพงษ์ ก.", "คุณพิมพ์ชนก ว.", "คุณสมหมาย ใจดี", "คุณอรทัย พ.", "คุณกิตติ ม.", "คุณวริศรา ต.", "คุณชัยวัฒน์ ร."];
const SNIPPETS = [
  "ทานต่อเนื่องมา 1 เดือน รู้สึกสดชื่นขึ้นจริง บรรจุภัณฑ์ดี ส่งไว ประทับใจมากครับ",
  "คุณภาพดีเกินราคา กลืนง่าย ไม่มีกลิ่นเหม็น สั่งซ้ำแน่นอน",
  "มีเลข อย. ชัดเจน มั่นใจได้ ทานแล้วไม่ระคายกระเพาะเลย แนะนำเลยค่ะ",
  "ของแท้ ราคาคุ้ม จัดส่งรวดเร็วมาก แพ็คมาอย่างดี",
  "ทานแล้วร่างกายดีขึ้น พักผ่อนได้ดีขึ้น จะกลับมาอุดหนุนอีกแน่นอน",
  "ปรึกษาเภสัชกรก่อนซื้อ ได้คำแนะนำดีมาก เลือกได้ตรงกับที่ต้องการ",
];

export default function ProductReviews({ productId }: { productId: string }) {
  const s = seed(productId);
  // เรตติ้งเฉลี่ย 4.5–4.9 และจำนวนรีวิว 80–980 (คงที่ต่อสินค้า)
  const { avg, total } = getProductRating(productId);

  // กระจายดาว (5→1) ให้ดูสมจริง: ส่วนใหญ่อยู่ที่ 5 และ 4
  const dist = [
    Math.round(total * 0.72),
    Math.round(total * 0.20),
    Math.round(total * 0.05),
    Math.round(total * 0.02),
    Math.round(total * 0.01),
  ];

  // เลือกรีวิวตัวอย่าง 3 อัน (deterministic)
  const picks = [0, 1, 2].map((k) => {
    const i = (s + k * 7) % SNIPPETS.length;
    const ni = (s + k * 3) % NAMES.length;
    const day = 1 + ((s + k * 11) % 27);
    return { name: NAMES[ni], text: SNIPPETS[i], stars: k === 2 ? 4 : 5, date: `${day} มิ.ย. 2569` };
  });

  return (
    <section style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--neutral-100)" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--neutral-900)", marginBottom: 24 }}>
        คะแนนและรีวิว
      </h2>

      <div className="rv-top" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 36, alignItems: "center", marginBottom: 32 }}>
        {/* คะแนนรวม */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 56, lineHeight: 1, color: "var(--neutral-900)" }}>
            {avg.toFixed(1)}<span style={{ fontSize: 22, color: "var(--neutral-400)" }}>/5</span>
          </div>
          <div style={{ margin: "10px 0 6px", display: "flex", justifyContent: "center" }}><Stars value={avg} size={18} /></div>
          <p style={{ fontSize: 13, color: "var(--neutral-500)" }}>({total.toLocaleString()} รีวิว)</p>
        </div>

        {/* แท่งกระจายดาว */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[5, 4, 3, 2, 1].map((star, idx) => {
            const pct = total ? Math.round((dist[idx] / total) * 100) : 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "var(--neutral-600)", width: 14, textAlign: "right" }}>{star}</span>
                <IconStarSm />
                <div style={{ flex: 1, height: 8, background: "var(--neutral-100)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#F59E0B", borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, color: "var(--neutral-400)", width: 34, textAlign: "right" }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* การ์ดรีวิว */}
      <div className="rv-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {picks.map((r, i) => (
          <div key={i} className="card" style={{ padding: "18px 18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--teal-50)", color: "var(--teal-700)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {r.name.replace("คุณ", "").trim().charAt(0)}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--neutral-800)", margin: 0 }}>{r.name}</p>
                <p style={{ fontSize: 11.5, color: "var(--neutral-400)", margin: 0 }}>{r.date} · ผู้ซื้อจริง</p>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}><Stars value={r.stars} size={13} /></div>
            <p style={{ fontSize: 13.5, color: "var(--neutral-600)", lineHeight: 1.7, margin: 0 }}>{r.text}</p>
          </div>
        ))}
      </div>

      <style>{`@media(max-width:768px){
        .rv-top{grid-template-columns:1fr!important;gap:20px!important}
        .rv-cards{grid-template-columns:1fr!important}
      }`}</style>
    </section>
  );
}

function IconStarSm() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
