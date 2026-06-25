import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReviewForm from "../ReviewForm";

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: review } = await supabase.from("reviews").select("*").eq("id", id).single();
  if (!review) notFound();
  return <ReviewForm review={review} />;
}
