import { IconStar } from "./icons";

// แสดงดาว 5 ดวงตามคะแนน (เต็มดวงเมื่อถึงจำนวนเต็มที่ปัด, ครึ่งดวงใช้ความทึบ)
export default function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, lineHeight: 0 }} aria-label={`${value.toFixed(1)} จาก 5 ดาว`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = value >= i ? 1 : value >= i - 0.5 ? 0.5 : 0;
        return (
          <span key={i} style={{ opacity: fill === 0 ? 1 : 1, position: "relative", display: "inline-flex" }}>
            <IconStar size={size} color={fill > 0 ? "#F59E0B" : "var(--neutral-200)"} />
          </span>
        );
      })}
    </span>
  );
}
