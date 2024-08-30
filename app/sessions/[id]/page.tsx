"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import IdeaForm from "@/components/idea-form";
import IdeaList from "@/components/idea-list";

export default function SessionDetail({ params }) {
  const [session, setSession] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
      } else {
        setSession(data);
      }
    };

    fetchSession();
  }, [params.id]);

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{session.title}</h1>
      <p className="text-lg mb-8">{session.prompt}</p>
      <IdeaForm sessionId={session.id} />
      <IdeaList sessionId={session.id} />
    </div>
  );
}