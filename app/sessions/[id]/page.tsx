import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import SessionDetail from "@/components/session-detail";

export default async function SessionPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    console.error("Error fetching session:", error);
    return <div>Error loading session. Please try again later.</div>;
  }

  if (!session) {
    return <div>Session not found.</div>;
  }

  return <SessionDetail session={session} />;
}