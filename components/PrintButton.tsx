"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print" style={{
      background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)",
      padding: "10px 24px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer",
    }}>
      🖨️ พิมพ์ใบกำกับภาษี
    </button>
  );
}
