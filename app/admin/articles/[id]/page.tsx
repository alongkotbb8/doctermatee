import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "../ArticleForm";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from("articles").select("*").eq("id", id).single();
  if (!article) notFound();
  return <ArticleForm article={article as any} />;
}
