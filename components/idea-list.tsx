"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import IdeaCard from "@/components/idea-card";

export default function IdeaList({ sessionId }: { sessionId: string }) {
  const [ideas, setIdeas] = useState<Array<any>>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchIdeas = async () => {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("session_id", sessionId)
        .order("upvotes", { ascending: false });

      if (error) {
        console.error("Error fetching ideas:", error);
      } else {
        setIdeas(data);
      }
    };

    fetchIdeas();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`ideas_${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, fetchIdeas)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  return (
    <div className="space-y-4">
      {ideas.map((idea: { id: string }) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}