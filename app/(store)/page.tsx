import Link from "next/link";
import { getActiveProducts, getCategories, getPublishedArticles, getSettings, getActiveBanners, type HomeArticle } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import HeroCarousel from "@/components/HeroCarousel";
import Stars from "@/components/Stars";
import { getFeaturedReviews } from "@/lib/reviews";
import Image from "next/image";
import { IconLeaf, IconShield, IconTag, IconArrowRight, IconFlask, IconPill, IconPackage, IconStar, IconHeartPulse, IconClock } from "@/components/icons";

export const revalidate = 60;

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
  const [allProducts, categories, allArticles, settings, banners] = await Promise.all([
    getActiveProducts(),
    getCategories(),
    getPublishedArticles(),
    getSettings(),
    getActiveBanners(),
  ]);

  const rawProducts = allProducts.slice(0, 9);
  const articles: HomeArticle[] = allArticles.slice(0, 4);
  const pinnedArticle = articles[0];
  const otherArticles = articles.slice(1, 4);

  const config = (settings.homepage_config ?? {}) as HomepageConfig;
  // hero ทั้งหมด (ข้อความ + รูป) อ่านจาก site_settings key="hero" เพื่อให้หน้า "แบนเนอร์" หลังบ้านคุมได้
  const heroCfg = (settings.hero ?? {}) as HeroConfig;
  const heroImg = heroCfg.image ?? null;
  const sections = config.sections ?? ["hero", "categories", "products", "promo"];
  const hc: HeroConfig = { ...(config.hero ?? {}), ...heroCfg };
  const pc = config.products ?? {};
  const promo = config.promo ?? {};

  const gridProducts = rawProducts.slice(0, 4);
  const featuredReviews = await getFeaturedReviews(3);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      {sections.includes("hero") && banners.length > 0 && <HeroCarousel banners={banners} />}

      {sections.includes("hero") && banners.length === 0 && (
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
                <Image src={heroImg} alt="Hero" width={600} height={380} style={{ width: "100%", maxHeight: 380, objectFit: "contain", borderRadius: "var(--radius-lg)" }} priority />
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
          <div className="stats-bar" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "linear-gradient(135deg,var(--green-50),#fff)", border: "1px solid var(--teal-100)", borderRadius: "var(--radius-lg)", padding: "24px 28px" }}>
            {STATS.map((s, i) => (
              <div key={s.label} className="stats-item" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 13, borderLeft: i > 0 ? "1px solid var(--teal-100)" : "none", padding: "8px 0" }}>
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

            {/* แถวการ์ดสินค้า: scroll แนวนอนบนมือถือ */}
            <div className="product-scroll-wrap">
              <div className="product-scroll-inner" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 22 }}>
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

            {/* แม็กกาซีน: บทความเด่นใหญ่ซ้าย + รายการขวา (แบบภาพอ้างอิง) */}
            <div className="home-articles-mag" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "stretch" }}>

              {/* เด่นซ้าย */}
              <Link href={`/articles/${pinnedArticle.slug}`} className="anim-fade-up" style={{ textDecoration: "none" }}>
                <article className="card pcard-hover" style={{ overflow: "hidden", display: "block" }}>
                  <div style={{ position: "relative", lineHeight: 0, display: "flex", justifyContent: "center", background: "var(--neutral-50)" }}>
                    {pinnedArticle.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pinnedArticle.cover_image} alt={pinnedArticle.title} style={{ maxWidth: "100%", maxHeight: 340, width: "auto", height: "auto", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "16/9", background: "linear-gradient(145deg,var(--green-50),var(--teal-50))", display: "flex", alignItems: "center", justifyContent: "center" }}><IconFlask size={64} color="var(--teal-300)" /></div>
                    )}
                    <span style={{ position: "absolute", top: 16, left: 16, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", color: "var(--teal-800)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, padding: "7px 14px", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-md)", display: "inline-flex", alignItems: "center", gap: 5 }}><IconStar size={13} color="var(--teal-600)" /> บทความแนะนำ</span>
                  </div>
                  <div style={{ padding: "22px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--neutral-400)", fontSize: 12.5, marginBottom: 10 }}>
                      <IconClock size={13} color="currentColor" /> {pinnedArticle.read_time_min ?? 5} นาที
                      {pinnedArticle.published_at && <span>· {new Date(pinnedArticle.published_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 23, lineHeight: 1.32, color: "var(--neutral-900)", margin: "0 0 12px", letterSpacing: "-.01em" }}>{pinnedArticle.title}</h3>
                    {pinnedArticle.excerpt && <p style={{ fontSize: 14.5, color: "var(--neutral-500)", lineHeight: 1.75, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{pinnedArticle.excerpt}</p>}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--teal-600)", fontSize: 14, fontWeight: 600 }}>อ่านบทความ <IconArrowRight size={14} color="var(--teal-600)" /></span>
                  </div>
                </article>
              </Link>

              {/* รายการขวา 3 ใบ — ภาพซ้าย ข้อความขวา ยืดเต็มความสูง section */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {otherArticles.map((a, i) => (
                  <Link key={a.id} href={`/articles/${a.slug}`} className={`anim-fade-up d${Math.min(i + 2, 5)}`} style={{ textDecoration: "none", flex: 1, display: "block" }}>
                    <article className="card pcard-hover" style={{ display: "flex", alignItems: "center", gap: 16, padding: 14, height: "100%" }}>
                      <div style={{ width: "40%", flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "var(--neutral-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {a.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.cover_image} alt={a.title} loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
                        ) : (
                          <div style={{ width: "100%", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}><IconPill size={30} color="var(--teal-300)" /></div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                        <span style={{ fontSize: 11, color: "var(--teal-600)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>บทความ</span>
                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--neutral-900)", margin: 0, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.title}</h3>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--neutral-400)" }}><IconClock size={12} color="currentColor" /> {a.read_time_min ?? 5} นาที</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── รีวิว & เปรียบเทียบ (AEO/GEO) ────────────────── */}
      {featuredReviews.length > 0 && (
        <section className="reveal" style={{ background: "#fff", padding: "16px 0 64px" }}>
          <div className="wrap">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-.02em", color: "var(--neutral-900)" }}>รีวิว & เปรียบเทียบ</h2>
                <p style={{ color: "var(--neutral-500)", fontSize: 14, marginTop: 4 }}>เลือกยี่ห้อไหนดี? เภสัชกรเปรียบเทียบให้แล้ว พร้อมคะแนนและข้อดี-ข้อเสีย</p>
              </div>
              <Link href="/reviews" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--teal-700)", textDecoration: "none" }}>
                ดูทั้งหมด <IconArrowRight size={14} color="var(--teal-700)" />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {featuredReviews.map((r, i) => {
                const top = r.products.find((p) => p.highlight) ?? r.products[0];
                return (
                  <Link key={r.slug} href={`/reviews/${r.slug}`} className={`anim-fade-up d${Math.min(i + 1, 5)}`} style={{ textDecoration: "none" }}>
                    <article className="card pcard-hover" style={{ padding: "22px 22px 24px", height: "100%", display: "flex", flexDirection: "column", transition: "box-shadow .2s, transform .2s" }}>
                      <span style={{ alignSelf: "flex-start", background: "var(--teal-50)", color: "var(--teal-700)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, padding: "4px 12px", borderRadius: "var(--radius-full)", marginBottom: 14 }}>{r.category}</span>
                      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--neutral-900)", lineHeight: 1.4, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.question}</h3>
                      <p style={{ fontSize: 13.5, color: "var(--neutral-500)", lineHeight: 1.7, margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.summary}</p>
                      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--neutral-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Stars value={top.rating} size={14} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--neutral-700)" }}>{top.rating.toFixed(1)}</span>
                        </span>
                        <span style={{ fontSize: 13, color: "var(--teal-600)", fontWeight: 600 }}>อ่านรีวิว →</span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
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
