const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM = "Doctermatee <noreply@doctermatee.co.th>";

interface ShippingEmailData {
  to: string;
  orderNo: string;
  orderId: string;
  trackingNumber: string;
  recipientName: string;
}

export async function sendShippingEmail(data: ShippingEmailData): Promise<void> {
  if (!RESEND_API_KEY || !data.to) return;

  const html = `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
      <tr><td style="background:linear-gradient(135deg,#1D4ED8,#3B82F6);padding:32px 40px;text-align:center">
        <p style="margin:0;font-size:24px;font-weight:800;color:#fff">Doctermatee</p>
        <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,.8)">สินค้าของคุณถูกจัดส่งแล้ว! 🚚</p>
      </td></tr>
      <tr><td style="padding:32px 40px">
        <p style="font-size:15px;color:#374151">สวัสดีคุณ ${data.recipientName},</p>
        <p style="font-size:14px;color:#6B7280;line-height:1.7">ออเดอร์ <strong>#${data.orderNo}</strong> ของคุณถูกจัดส่งแล้วครับ สามารถติดตามพัสดุได้ด้วยเลขด้านล่าง</p>
        <div style="background:#EFF6FF;border:2px solid #BFDBFE;border-radius:12px;padding:20px 24px;text-align:center;margin:20px 0">
          <p style="margin:0 0 6px;font-size:12px;color:#1E40AF;font-weight:600;text-transform:uppercase;letter-spacing:.08em">เลขพัสดุ</p>
          <p style="margin:0;font-size:26px;font-weight:800;color:#1E40AF;letter-spacing:.12em">${data.trackingNumber}</p>
        </div>
        <p style="font-size:13px;color:#9CA3AF;text-align:center">ติดตามได้ที่เว็บไซต์ไปรษณีย์ไทย trackthaipost.com</p>
        <div style="text-align:center;margin-top:24px">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order/${data.orderId}"
            style="display:inline-block;background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:700">
            ดูรายละเอียดออเดอร์
          </a>
        </div>
      </td></tr>
      <tr><td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #F3F4F6">
        <p style="margin:0;font-size:12px;color:#9CA3AF">ขอบคุณที่เลือกซื้อกับ Doctermatee ครับ 🙏</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [data.to],
      subject: `พัสดุออกแล้ว! เลขติดตาม ${data.trackingNumber} — Doctermatee`,
      html,
    }),
  });
}

interface OrderEmailData {
  to: string;
  orderNo: string;
  orderId: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: {
    full_name: string;
    phone: string;
    address: string;
    district: string;
    province: string;
    postal_code: string;
  };
}

function orderEmailHtml(data: OrderEmailData): string {
  const rows = data.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #F3F4F6">${i.name}</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;text-align:center;border-bottom:1px solid #F3F4F6">x${i.qty}</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;text-align:right;border-bottom:1px solid #F3F4F6">฿${(i.price * i.qty).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const addr = data.shippingAddress;

  return `<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 0">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0F766E,#14B8A6);padding:32px 40px;text-align:center">
        <p style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px">Doctermatee</p>
        <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,.8)">ยืนยันการสั่งซื้อ</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:32px 40px">
        <p style="margin:0 0 4px;font-size:13px;color:#6B7280">หมายเลขออเดอร์</p>
        <p style="margin:0 0 24px;font-size:22px;font-weight:800;color:#111827">#${data.orderNo}</p>

        <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#374151">รายการสินค้า</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <th style="text-align:left;font-size:12px;color:#9CA3AF;font-weight:600;padding-bottom:8px;border-bottom:2px solid #F3F4F6">สินค้า</th>
            <th style="text-align:center;font-size:12px;color:#9CA3AF;font-weight:600;padding-bottom:8px;border-bottom:2px solid #F3F4F6">จำนวน</th>
            <th style="text-align:right;font-size:12px;color:#9CA3AF;font-weight:600;padding-bottom:8px;border-bottom:2px solid #F3F4F6">ราคา</th>
          </tr>
          ${rows}
        </table>

        <!-- Totals -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
          <tr>
            <td style="font-size:13px;color:#6B7280;padding:4px 0">ราคาสินค้า</td>
            <td style="font-size:13px;color:#374151;text-align:right;padding:4px 0">฿${data.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6B7280;padding:4px 0">ค่าจัดส่ง</td>
            <td style="font-size:13px;color:#374151;text-align:right;padding:4px 0">${data.shipping === 0 ? "ฟรี" : `฿${data.shipping}`}</td>
          </tr>
          ${data.discount > 0 ? `<tr>
            <td style="font-size:13px;color:#6B7280;padding:4px 0">ส่วนลด</td>
            <td style="font-size:13px;color:#EF4444;text-align:right;padding:4px 0">-฿${data.discount.toLocaleString()}</td>
          </tr>` : ""}
          <tr>
            <td style="font-size:16px;font-weight:700;color:#111827;padding:12px 0 0;border-top:2px solid #111827">ยอดรวม</td>
            <td style="font-size:20px;font-weight:800;color:#0F766E;text-align:right;padding:12px 0 0;border-top:2px solid #111827">฿${data.total.toLocaleString()}</td>
          </tr>
        </table>

        <!-- Shipping address -->
        <div style="margin-top:28px;background:#F9FAFB;border-radius:12px;padding:20px 24px">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#374151">ที่อยู่จัดส่ง</p>
          <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.8">
            ${addr.full_name}<br>
            ${addr.phone}<br>
            ${addr.address}<br>
            ${addr.district} ${addr.province} ${addr.postal_code}
          </p>
        </div>

        <!-- Track button -->
        <div style="text-align:center;margin-top:28px">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order/${data.orderId}"
            style="display:inline-block;background:#0F766E;color:#fff;text-decoration:none;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:700">
            ติดตามออเดอร์
          </a>
        </div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #F3F4F6">
        <p style="margin:0;font-size:12px;color:#9CA3AF">มีคำถาม? ติดต่อเราได้ที่ LINE @doctermatee หรือโทร 02-XXX-XXXX</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function sendOrderConfirmEmail(data: OrderEmailData): Promise<void> {
  if (!RESEND_API_KEY || !data.to) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [data.to],
      subject: `ยืนยันออเดอร์ #${data.orderNo} — Doctermatee`,
      html: orderEmailHtml(data),
    }),
  });
}
