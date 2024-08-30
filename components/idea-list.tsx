"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import IdeaCard from "@/components/idea-card";
import IdeaForm from "@/components/idea-form";
import { Idea } from "@/types";

export default function IdeaList({ sessionId }: { sessionId: string }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching ideas:", error);
        setError("Failed to load ideas");
      } else {
        setIdeas(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`ideas_${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas", filter: `session_id=eq.${sessionId}` }, fetchIdeas)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  const handleNewIdea = (newIdea: Idea) => {
    setIdeas(prevIdeas => [newIdea, ...prevIdeas]);
  };

  if (isLoading) return <div>Loading ideas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <IdeaForm sessionId={sessionId} onIdeaAdded={handleNewIdea} />
      <div className="space-y-4">
        {ideas.length === 0 ? (
          <p>No ideas yet. Be the first to submit one!</p>
        ) : (
          ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))
        )}
      </div>
    </div>
  );
}