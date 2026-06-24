import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import AddToCartButton from "@/components/AddToCartButton";
import Image from "next/image";
import { IconLeaf, IconShield, IconTag, IconArrowRight, IconFlask, IconPill, IconPackage, IconStar, IconHeartPulse, IconClock } from "@/components/icons";
import type { Product } from "@/lib/types";

interface HomeArticle { id: string; title: string; slug: string; excerpt: string | null; cover_image: string | null; read_time_min: number | null; published_at: string | null; }

const STATS = [
  { icon: <IconPackage size={26} color="var(--teal-600)" />, value: "10,000+", label: "กระปุกที่จำหน่ายแล้ว" },
  { icon: <IconStar size={26} color="var(--teal-600)" />, value: "4.9/5", label: "คะแนนรีวิวเฉลี่ย" },
  { icon: <IconHeartPulse size={26} color="var(--teal-600)" />, value: "98%", label: "ลูกค้าพึงพอใจ" },
  { icon: <IconShield size={26} color="var(--teal-600)" />, value: "100%", label: "สินค้ามีเลข อย." },
];

const CAT_ICON_KEY: Record<string, string> = {
  vitamins: "pill",
  supplements: "flask",
  beauty: "sparkles",
  "mother-and-child": "baby",
  "medical-devices": "heartpulse",
};

interface HeroConfig { title?: string; accent?: string; subtitle?: string; image?: string; cta_primary?: string; cta_secondary?: string; }
interface ProductsConfig { title?: string; subtitle?: string; limit?: number; }
interface PromoConfig { title?: string; subtitle?: string; cta?: string; show?: boolean; }
interface HomepageConfig { sections?: string[]; hero?: HeroConfig; products?: ProductsConfig; promo?: PromoConfig; }

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: rawProducts }, { data: categories }, { data: configRow }, { data: heroRow }, { data: articleRows }] = await Promise.all([
    supabase.from("products").select("*, categories(id,name,slug)").eq("status", "active").order("created_at", { ascending: false }).limit(9),
    supabase.from("categories").select("*").order("name"),
    supabase.from("site_settings").select("value").eq("key", "homepage_config").single(),
    supabase.from("site_settings").select("value").eq("key", "hero").single(),
    supabase.from("articles").select("id, title, slug, excerpt, cover_image, read_time_min, published_at").eq("is_published", true).order("published_at", { ascending: false }).limit(4),
  ]);

  const articles = (articleRows ?? []) as HomeArticle[];
  const pinnedArticle = articles[0];
  const otherArticles = articles.slice(1, 4);

  const config = (configRow?.value ?? {}) as HomepageConfig;
  // hero ทั้งหมด (ข้อความ + รูป) อ่านจาก site_settings key="hero" เพื่อให้หน้า "แบนเนอร์" หลังบ้านคุมได้
  const heroCfg = (heroRow?.value ?? {}) as HeroConfig;
  const heroImg = heroCfg.image ?? null;
  const sections = config.sections ?? ["hero", "categories", "products", "promo"];
  const hc: HeroConfig = { ...(config.hero ?? {}), ...heroCfg };
  const pc = config.products ?? {};
  const promo = config.promo ?? {};

  const products = (rawProducts ?? []) as Product[];
  const featuredProduct = products[0];
  const gridProducts = products.slice(1, (pc.limit ?? 7));
  const featuredDiscount = featuredProduct?.compare_at_price && featuredProduct.compare_at_price > featuredProduct.price
    ? Math.round((1 - featuredProduct.price / featuredProduct.compare_at_price) * 100) : null;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      {sections.includes("hero") && (
        <section style={{ background: "var(--gradient-hero)", overflow: "hidden" }}>
          <div className="wrap grid-12" style={{ alignItems: "center", gap: 48, paddingTop: 60, paddingBottom: 68 }}>

            {/* Left copy */}
            <div className="col-7">
              <span className="anim-fade-up d1" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "var(--teal-700)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, padding: "6px 14px", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-sm)", marginBottom: 20 }}>
                <IconLeaf size={13} color="var(--teal-600)" /> สินค้าคุณภาพสูง มีเลข อย.
              </span>

              <h1 className="anim-fade-up d2" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.15, letterSpacing: "-.025em", color: "var(--neutral-900)", marginBottom: 14 }}>
                {hc.title ?? "สุขภาพดี"}<br />
                <span style={{ color: "var(--teal-600)" }}>{hc.accent ?? "เริ่มต้นที่นี่"}</span>
              </h1>

              <p className="anim-fade-up d3" style={{ fontSize: 15, color: "var(--neutral-600)", maxWidth: 400, marginBottom: 28, lineHeight: 1.75 }}>
                {hc.subtitle ?? "อาหารเสริม วิตามิน และผลิตภัณฑ์ดูแลสุขภาพคุณภาพสูง พร้อมคำแนะนำจากแพทย์ผู้เชี่ยวชาญ จัดส่งฟรีเมื่อสั่งซื้อครบ ฿500"}
              </p>

              <div className="anim-fade-up d4" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
                <Link href="/products" className="btn-pop" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "12px 24px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                  {hc.cta_primary ?? "เลือกสินค้า"}
                </Link>
                <Link href="/articles" className="btn-pop" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: "var(--teal-700)", border: "1.5px solid var(--teal-600)", borderRadius: "var(--radius-full)", padding: "11px 22px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                  {hc.cta_secondary ?? "บทความสุขภาพ"}
                </Link>
              </div>

              <div className="anim-fade-up d5" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { icon: <IconShield size={14} color="var(--teal-600)" />, text: "ของแท้ มีเลข อย." },
                  { icon: <IconLeaf size={14} color="var(--teal-600)" />, text: "ส่งฟรีครบ ฿500" },
                  { icon: <IconTag size={14} color="var(--teal-600)" />, text: "ราคาดีที่สุด" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--neutral-500)", fontWeight: 500 }}>
                    {icon}{text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — image or bottle */}
            <div className="col-5 anim-fade-in d2" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 340, position: "relative" }}>
              {heroImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImg} alt="Hero" style={{ width: "100%", maxHeight: 380, objectFit: "contain", borderRadius: "var(--radius-lg)" }} />
              ) : (
                <div className="anim-float" style={{ position: "relative", width: 200 }}>
                  <div style={{ width: 118, height: 42, background: "var(--teal-800)", borderRadius: "12px 12px 6px 6px", margin: "0 auto", zIndex: 2, position: "relative" }} />
                  <div style={{ width: 104, height: 14, background: "var(--teal-700)", margin: "-2px auto 0", borderRadius: "0 0 6px 6px" }} />
                  <div style={{ width: 200, height: 248, background: "linear-gradient(160deg,#fff 0%,#E1F5EE 100%)", borderRadius: 28, boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 18, textAlign: "center", border: "1px solid #CFFAEE" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, lineHeight: 1.15, color: "var(--teal-700)", letterSpacing: "-.02em", textTransform: "uppercase" }}>
                      Doctermatee<br />Health
                    </span>
                    <span style={{ fontSize: 10, color: "var(--teal-500)", marginTop: 10, letterSpacing: ".07em" }}>PREMIUM SUPPLEMENT</span>
                  </div>

                  <span className="badge-float" style={{ position: "absolute", top: 20, right: -14, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(14px)", borderRadius: "var(--radius-full)", padding: "7px 12px", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--teal-800)", boxShadow: "var(--shadow-md)", whiteSpace: "nowrap" }}>
                    <IconPill size={13} color="var(--teal-600)" /> วิตามินครบถ้วน
                  </span>
                  <span className="badge-float-delay" style={{ position: "absolute", bottom: 40, left: -18, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(14px)", borderRadius: "var(--radius-full)", padding: "7px 12px", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "var(--teal-800)", boxShadow: "var(--shadow-md)", whiteSpace: "nowrap" }}>
                    <IconShield size={13} color="var(--teal-600)" /> แนะนำโดยแพทย์
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Stats / social proof ─────────────────────────── */}
      <section className="reveal" style={{ background: "#fff", padding: "16px 0 8px" }}>
        <div className="wrap">
          <div className="stats-bar" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "20px 8px", background: "linear-gradient(135deg,var(--green-50),#fff)", border: "1px solid var(--teal-100)", borderRadius: "var(--radius-lg)", padding: "24px 28px" }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 13, flex: "1 1 0", minWidth: 180, borderLeft: i > 0 ? "1px solid var(--teal-100)" : "none" }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)", flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)", letterSpacing: "-.02em" }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--neutral-500)" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products: Featured + Grid ─────────────────────── */}
      {sections.includes("products") && (
        <section className="reveal" style={{ padding: "40px 0 72px" }}>
          <div className="wrap">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div className="anim-fade-up">
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-.02em", color: "var(--neutral-900)" }}>
                  {pc.title ?? "วันนี้คุณต้องการอะไร?"}
                </h2>
                <p style={{ color: "var(--neutral-500)", fontSize: 14, marginTop: 4 }}>
                  {pc.subtitle ?? "สินค้าแนะนำและดีลพิเศษประจำสัปดาห์"}
                </p>
              </div>
              <Link href="/products" className="anim-fade-in" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--teal-700)", textDecoration: "none", transition: "gap 0.2s var(--ease)" }}>
                ดูทั้งหมด <IconArrowRight size={14} color="var(--teal-700)" />
              </Link>
            </div>

            <div className="grid-12" style={{ gap: 22 }}>
              {/* Featured — left */}
              {featuredProduct && (
                <Link href={`/products/${featuredProduct.slug}`} style={{ textDecoration: "none", display: "block" }} className="col-4 anim-fade-up">
                  <article className="featured-hover card" style={{ height: "100%", display: "flex", flexDirection: "column", borderColor: "var(--teal-100)", background: "linear-gradient(145deg,#ECFDF5,#fff)" }}>
                    <div style={{ flex: 1, minHeight: 280, background: "linear-gradient(145deg,var(--green-50),var(--teal-50))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: 24 }}>
                      {featuredProduct.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={featuredProduct.images[0]} alt={featuredProduct.name} style={{ maxHeight: 260, objectFit: "contain" }} />
                      ) : (
                        <IconFlask size={90} color="var(--teal-400)" />
                      )}
                      {featuredDiscount && (
                        <span style={{ position: "absolute", top: 14, right: 14, background: "var(--color-sale)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, padding: "5px 12px", borderRadius: "var(--radius-full)" }}>
                          ลด {featuredDiscount}%
                        </span>
                      )}
                      <span style={{ position: "absolute", top: 14, left: 14, background: "var(--teal-600)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, padding: "4px 10px", borderRadius: "var(--radius-full)" }}>
                        แนะนำ
                      </span>
                    </div>
                    <div style={{ padding: "18px 20px 22px" }}>
                      <span style={{ fontSize: 11, color: "var(--teal-600)", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>
                        {featuredProduct.categories?.name ?? ""}
                      </span>
                      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--neutral-900)", margin: "5px 0 8px", lineHeight: 1.3 }}>
                        {featuredProduct.name}
                      </h3>
                      {featuredProduct.description && (
                        <p style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 14, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {featuredProduct.description}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        {featuredProduct.compare_at_price && (
                          <span style={{ fontSize: 13, color: "var(--neutral-400)", textDecoration: "line-through" }}>
                            ฿{featuredProduct.compare_at_price.toLocaleString()}
                          </span>
                        )}
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--teal-600)" }}>
                          ฿{featuredProduct.price.toLocaleString()}
                        </span>
                      </div>
                      <AddToCartButton
                        productId={featuredProduct.id}
                        productName={featuredProduct.name}
                        price={featuredProduct.price}
                        compareAtPrice={featuredProduct.compare_at_price}
                        image={featuredProduct.images[0] ?? null}
                        categoryName={featuredProduct.categories?.name ?? null}
                        stock={featuredProduct.stock}
                        size="lg"
                      />
                    </div>
                  </article>
                </Link>
              )}

              {/* Grid — right */}
              <div className="col-8" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, alignContent: "start" }}>
                {gridProducts.map((p, i) => (
                  <div key={p.id} className={`anim-fade-up d${Math.min(i + 1, 5)}`}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Categories (ระหว่างสินค้ากับบทความ) ───────────── */}
      {sections.includes("categories") && (categories?.length ?? 0) > 0 && (
        <section className="reveal" style={{ background: "#fff", padding: "16px 0 56px" }}>
          <div className="wrap">
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, letterSpacing: "-.02em", color: "var(--neutral-900)", marginBottom: 20 }}>เลือกตามหมวดหมู่</h2>
            <div className="cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 22 }}>
              {categories!.map((cat, i) => (
                <div key={cat.id} className={`anim-pop-in d${Math.min(i + 1, 5)}`}>
                  <CategoryCard href={`/products?category=${cat.slug}`} iconKey={CAT_ICON_KEY[cat.slug] ?? "pill"} name={cat.name} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Articles: pinned + cards ─────────────────────── */}
      {pinnedArticle && (
        <section className="reveal" style={{ padding: "16px 0 64px" }}>
          <div className="wrap">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-.02em", color: "var(--neutral-900)" }}>บทความสุขภาพ</h2>
                <p style={{ color: "var(--neutral-500)", fontSize: 14, marginTop: 4 }}>ความรู้และเคล็ดลับดูแลสุขภาพจากผู้เชี่ยวชาญ</p>
              </div>
              <Link href="/articles" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--teal-700)", textDecoration: "none" }}>
                ดูทั้งหมด <IconArrowRight size={14} color="var(--teal-700)" />
              </Link>
            </div>

            {/* Pinned (ปักหมุด) */}
            <Link href={`/articles/${pinnedArticle.slug}`} style={{ textDecoration: "none", display: "block" }} className="anim-fade-up">
              <article className="featured-hover card pinned-article" style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", overflow: "hidden", marginBottom: otherArticles.length ? 20 : 0, borderColor: "var(--teal-100)" }}>
                <div style={{ position: "relative", minHeight: 280, background: "linear-gradient(145deg,var(--green-50),var(--teal-50))" }}>
                  {pinnedArticle.cover_image ? (
                    <Image src={pinnedArticle.cover_image} alt={pinnedArticle.title} fill style={{ objectFit: "cover" }} sizes="(max-width:768px) 100vw, 560px" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center" }}><IconFlask size={72} color="var(--teal-300)" /></div>
                  )}
                  <span style={{ position: "absolute", top: 16, left: 16, background: "var(--teal-600)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, padding: "5px 14px", borderRadius: "var(--radius-full)" }}>
                    ★ บทความแนะนำ
                  </span>
                </div>
                <div style={{ padding: "32px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--neutral-400)", fontSize: 12, marginBottom: 12 }}>
                    <IconClock size={13} color="currentColor" /> {pinnedArticle.read_time_min ?? 5} นาที
                    {pinnedArticle.published_at && <span>· {new Date(pinnedArticle.published_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, lineHeight: 1.3, color: "var(--neutral-900)", margin: "0 0 12px", letterSpacing: "-.01em" }}>{pinnedArticle.title}</h3>
                  {pinnedArticle.excerpt && <p style={{ fontSize: 14.5, color: "var(--neutral-500)", lineHeight: 1.8, margin: "0 0 20px" }}>{pinnedArticle.excerpt}</p>}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start", background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "10px 22px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14 }}>
                    อ่านบทความ <IconArrowRight size={14} color="#fff" />
                  </span>
                </div>
              </article>
            </Link>

            {/* Other articles */}
            {otherArticles.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {otherArticles.map((a, i) => (
                  <Link key={a.id} href={`/articles/${a.slug}`} style={{ textDecoration: "none" }} className={`anim-fade-up d${Math.min(i + 1, 5)}`}>
                    <article className="card pcard-hover" style={{ overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                      <div style={{ height: 160, background: "linear-gradient(145deg,var(--green-50),var(--teal-50))", position: "relative", flexShrink: 0 }}>
                        {a.cover_image ? (
                          <Image src={a.cover_image} alt={a.title} fill style={{ objectFit: "cover" }} sizes="(max-width:768px) 100vw, 360px" />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><IconPill size={40} color="var(--teal-300)" /></div>
                        )}
                      </div>
                      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--neutral-400)", fontSize: 12, marginBottom: 8 }}>
                          <IconClock size={12} color="currentColor" /> {a.read_time_min ?? 5} นาที
                        </div>
                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)", margin: 0, lineHeight: 1.4 }}>{a.title}</h3>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Promo banner ─────────────────────────────────── */}
      {sections.includes("promo") && promo.show !== false && (
        <section className="reveal" style={{ padding: "0 0 72px" }}>
          <div className="wrap">
            <div className="anim-fade-up" style={{ background: "linear-gradient(120deg,var(--teal-700),var(--teal-500))", borderRadius: "var(--radius-lg)", padding: "44px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, color: "#fff", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: 10 }}>
                  <IconTag size={20} color="#fff" /> {promo.title ?? "ใช้โค้ด WELCOME10"}
                </h2>
                <p style={{ color: "#CFFAEE", marginTop: 6, fontSize: 14 }}>{promo.subtitle ?? "รับส่วนลด 10% สำหรับลูกค้าใหม่ เมื่อสั่งซื้อครบ ฿300"}</p>
              </div>
              <Link href="/products" className="promo-btn" style={{ background: "#fff", color: "var(--teal-700)", borderRadius: "var(--radius-full)", padding: "12px 24px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
                <IconArrowRight size={15} color="var(--teal-700)" /> {promo.cta ?? "ช้อปเลย"}
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
