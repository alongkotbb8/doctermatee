# QA Checklist — Doctermatee

> **สี tag บอกวิธีทดสอบ**
> - `[sandbox]` — ทดสอบด้วย Omise test key ได้เลย
> - `[key จริง]` — ต้องใช้ Omise live key / อีเมลจริง บน production
>
> **บัตรทดสอบ Omise (sandbox):** `4242 4242 4242 4242` | Exp: `12/30` | CVV: `123`

---

## 1. หน้าร้านหลัก (Store UI)

- [ ] Homepage โหลดได้ — banner slideshow เล่นอัตโนมัติ (สไลด์เปลี่ยนทุก ~5 วิ)
- [ ] Section สินค้า 4 การ์ด ไม่มีการ์ดล้นขอบ
- [ ] Section หมวดหมู่ เลื่อนแนวนอนได้บนมือถือ
- [ ] Section บทความ — featured ซ้าย + รายการข้างขวา
- [ ] Scroll-reveal animation — แต่ละ section เลื่อนขึ้นมาเมื่อ scroll ถึง (opacity 0 → 1)
- [ ] Navbar hover เมนู เปลี่ยนเป็นสีหลัก (teal)
- [ ] Navbar liquid glass — พื้นหลังเปลี่ยน blur เมื่อ scroll ลง
- [ ] Hamburger menu มือถือ — เปิด/ปิด drawer ได้
- [ ] Footer แสดงเบอร์ / อีเมล / เวลาทำการจากหลังบ้าน
- [ ] Logo ไม่ ghost ไม่ซ้อน — ทั้ง Navbar และ Footer
- [ ] Browser tab แสดง favicon ใหม่ (ไม่ใช่สามเหลี่ยมดำ Next.js default)
- [ ] OG image — share ลิงก์บน Line/Facebook → เห็น preview ภาพ

---

## 2. สินค้า & ค้นหา

- [ ] หน้า `/products` แสดงรายการสินค้าครบ
- [ ] ค้นหาด้วย keyword → ผลลัพธ์ถูกต้อง (ลองพิมพ์ชื่อสินค้าในช่อง search)
- [ ] กรองตาม category → ผลลัพธ์กรองถูก
- [ ] คลิกเข้าหน้าสินค้าได้ (`/products/[slug]`)
- [ ] ปุ่ม "ซื้อเลย" มี motion ตอน hover (mouse ชี้แล้วต้องมี animation)
- [ ] ปุ่ม "ใส่ตะกร้า" — ลูกบอลบินไปหา cart icon

---

## 3. ตะกร้าสินค้า

- [ ] เพิ่มสินค้าลงตะกร้าได้ — ยอดรวมถูกต้อง
- [ ] เปลี่ยนจำนวน qty → ราคาอัปเดต
- [ ] ลบสินค้าออกจากตะกร้าได้
- [ ] รีเฟรชหน้า — cart ยังคงอยู่ (ต้องไม่หายหลัง refresh)
- [ ] ตะกร้าว่าง → แสดงหน้าว่างเปล่า ไม่ crash

---

## 4. บัญชีผู้ใช้

- [ ] `[sandbox]` สมัครสมาชิกใหม่ → ได้รับอีเมลยืนยัน
- [ ] Login → เข้าระบบสำเร็จ redirect กลับหน้าเดิม
- [ ] Logout → session หมด redirect ไป `/`
- [ ] `[sandbox]` ลืมรหัสผ่าน → อีเมล reset ถูกส่งไป
- [ ] เข้า `/account` — แสดงข้อมูลและประวัติออเดอร์ถูกต้อง

---

## 5. Checkout (ฟอร์มชำระเงิน)

- [ ] ฟอร์มที่อยู่ pre-fill อัตโนมัติ (ถ้า login และเคยสั่งแล้ว — FR1 auto-save address)
- [ ] ที่อยู่ถูก save ลง Supabase `profiles.default_address` หลังสั่งซื้อสำเร็จ (เช็คครั้งต่อไปว่า pre-fill ขึ้นมาเอง)
- [ ] ช่องไม่ครบ → highlight แดง — ไม่ส่งออเดอร์
- [ ] ค่าส่งฟรีเมื่อยอดถึง threshold (ค่าจาก Settings) → แสดง "ฟรี" ในสรุปออเดอร์
- [ ] เลือก PromptPay → หน้า payment สร้าง QR อัตโนมัติ (ไม่ต้องกดอีก)
- [ ] เลือกบัตรเครดิต → เห็นฟอร์มกรอกบัตรทันที
- [ ] โค้ดส่วนลดถูก → แสดง `-฿` และยอดรวมอัปเดต
- [ ] โค้ดส่วนลดผิด → แสดงข้อความ error
- [ ] Checkout โดยไม่ login (guest) → ยังสั่งได้

---

## 6. Payment — PromptPay

- [ ] `[sandbox]` QR Code โชว์หลังเข้าหน้า payment อัตโนมัติ (ไม่ต้องกดปุ่มใด ๆ)
- [ ] `[key จริง]` QR สแกนได้จริงด้วย app ธนาคาร
- [ ] `[key จริง]` ระบบ polling ทุก 4 วิ → redirect หลังสแกนสำเร็จ
- [ ] `[key จริง]` หน้า `/order/[id]` แสดงสถานะ "ชำระแล้ว"
- [ ] `[key จริง]` อีเมลยืนยันออเดอร์ถูกส่งหลังชำระ

---

## 7. Payment — บัตรเครดิต

- [ ] `[sandbox]` กรอก `4242 4242 4242 4242` / Exp `12/30` / CVV `123` → ชำระสำเร็จ
- [ ] บัตรไม่ถูกต้อง → error message โชว์ใต้ฟอร์ม
- [ ] `[sandbox]` ชำระสำเร็จ → redirect `/order/[id]?success=1`
- [ ] Cart ถูกล้างหลังชำระเสร็จ

---

## 8. Admin Panel

- [ ] Login admin → เข้า `/admin` ได้
- [ ] Non-admin login → redirect ออก (ไม่เข้าได้)
- [ ] เพิ่ม/แก้ไขสินค้า → โชว์ที่หน้าร้านหลัง revalidate cache
- [ ] เพิ่ม/แก้ไขบทความ → โชว์ที่ `/articles`
- [ ] จัดการ banner → slideshow อัปเดตที่หน้าแรก
- [ ] สร้าง coupon code → ใช้งานได้ที่ checkout
- [ ] ดูรายการออเดอร์ → อัปเดตสถานะจัดส่งได้
- [ ] Settings shipping → ค่าส่ง / free threshold อัปเดตที่หน้าร้าน
- [ ] กด revalidate cache → หน้าร้านดึงข้อมูลใหม่

---

## 9. Security (spot check)

- [ ] แก้ราคาใน DevTools ก่อน checkout → ยอดไม่เปลี่ยน (server คำนวณ)
  > วิธีตรวจ: Network tab → ดู request `/api/order` → `total` ที่ส่งไปเป็นค่าที่ client แก้ → response ยังถูกต้องตามราคาจริง
- [ ] เปิด `/admin` โดยไม่ login → redirect ออก
- [ ] `[key จริง]` Webhook URL รับ event จาก Omise → ไม่ error 500

---

## 10. หน้า Static & อื่น ๆ

- [ ] `/articles` — รายการบทความโหลดได้
- [ ] `/articles/[slug]` — เนื้อหาบทความแสดงถูกต้อง
- [ ] `/contact` — กรอกฟอร์มส่งข้อความ → ข้อความบันทึกใน Supabase `contact_messages`
  > (ยังไม่ส่งอีเมล — บันทึกแค่ในฐานข้อมูล อ่านได้จาก Supabase dashboard)
- [ ] `/order/[orderId]` — หน้าติดตามออเดอร์แสดงรายการสินค้า + สถานะถูกต้อง
- [ ] `/about`, `/faq`, `/privacy`, `/terms` — โหลดได้ไม่ 404
- [ ] `/api/revalidate` — เรียกจาก admin → cache bust สำเร็จ หน้าร้านข้อมูลใหม่

---

## 11. Mobile / Responsive

- [ ] Navbar hamburger เปิด/ปิด drawer บนมือถือ
- [ ] ตะกร้าสินค้า layout ไม่แตก บนหน้าจอ 375px
- [ ] Checkout form กรอกได้สะดวกบนมือถือ
- [ ] หน้าชำระ QR ขนาดเหมาะสม ไม่เล็กเกินสแกน

---

## สรุปลำดับทดสอบที่แนะนำ

```
UI → สินค้า → Cart → Auth → Checkout → Payment sandbox → Order tracking → Admin → Security → Static pages → Mobile
```

**รายการที่ต้องรอ live key ก่อน (ข้ามได้ในช่วง sandbox):**
- PromptPay สแกนจริง + polling redirect
- อีเมลยืนยันออเดอร์
- Webhook จาก Omise
