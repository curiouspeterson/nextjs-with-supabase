"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import IdeaCard from "@/components/idea-card";
import { Idea } from "@/types";

export default function IdeaList({ sessionId }: { sessionId: string }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setError("Failed to load ideas");
      } else {
        setIdeas(data as Idea[]);
      }
      setIsLoading(false);
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

  if (isLoading) return <div>Loading ideas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}