"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Session } from "@/types";
import IdeaList from "./idea-list";

export default function SessionDetail({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) {
        setError("Error fetching session");
        setIsLoading(false);
      } else {
        setSession(data);
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (isLoading) return <div>Loading session...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{session.title}</h1>
      <p className="mb-6">{session.prompt}</p>
      <IdeaList sessionId={session.id} />
    </div>
  );
}