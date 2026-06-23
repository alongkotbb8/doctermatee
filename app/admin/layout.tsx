import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "./AdminSidebar";

export const metadata = { title: "Admin — Doctermatee" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--neutral-50)" }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: "32px 36px" }}>
        {children}
      </main>
    </div>
  );
}
