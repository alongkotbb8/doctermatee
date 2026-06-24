import "server-only";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

/* ข้อมูลสาธารณะ (catalog) — ดึงด้วย service client (ไม่แตะ cookies) + cache
   ทำให้หน้าร้านเป็น static/ISR กดลิงก์เร็ว ไม่ยิง DB ทุกครั้ง
   admin แก้ข้อมูลแล้วจะเห็นผลภายใน revalidate วินาที */

export const getActiveProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const s = createServiceClient();
    const { data } = await s
      .from("products")
      .select("*, categories(id,name,slug)")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    return (data ?? []) as Product[];
  },
  ["active-products"],
  { revalidate: 60, tags: ["catalog"] }
);

export const getCategories = unstable_cache(
  async () => {
    const s = createServiceClient();
    const { data } = await s.from("categories").select("*").order("name");
    return data ?? [];
  },
  ["categories"],
  { revalidate: 300, tags: ["catalog"] }
);

export interface HomeArticle {
  id: string; title: string; slug: string; excerpt: string | null;
  cover_image: string | null; published_at: string | null; read_time_min: number | null;
}

export const getPublishedArticles = unstable_cache(
  async (): Promise<HomeArticle[]> => {
    const s = createServiceClient();
    const { data } = await s
      .from("articles")
      .select("id, title, slug, excerpt, cover_image, published_at, read_time_min")
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    return (data ?? []) as HomeArticle[];
  },
  ["published-articles"],
  { revalidate: 60, tags: ["articles"] }
);

export interface Banner {
  id: string; title: string | null; accent: string | null; subtitle: string | null;
  image: string | null; cta_primary: string | null; cta_primary_href: string | null;
  cta_secondary: string | null; cta_secondary_href: string | null;
  is_active: boolean; sort_order: number;
}

export const getActiveBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    const s = createServiceClient();
    const { data } = await s
      .from("banners")
      .select("id, title, accent, subtitle, image, cta_primary, cta_primary_href, cta_secondary, cta_secondary_href, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return (data ?? []) as Banner[];
  },
  ["active-banners"],
  { revalidate: 60, tags: ["banners"] }
);

export const getSettings = unstable_cache(
  async (): Promise<Record<string, Record<string, unknown>>> => {
    const s = createServiceClient();
    const { data } = await s.from("site_settings").select("key, value");
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, Record<string, unknown>>;
  },
  ["site-settings"],
  { revalidate: 60, tags: ["settings"] }
);
