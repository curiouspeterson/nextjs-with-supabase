"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Session, Idea } from "@/types";
import IdeaList from "./idea-list";

export default function SessionDetail({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [topIdeas, setTopIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchSessionAndTopIdeas = async () => {
    try {
      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Fetch top 3 ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from("ideas")
        .select("*")
        .eq("session_id", sessionId)
        .order("upvotes", { ascending: false })
        .limit(3);

      if (ideasError) throw ideasError;
      setTopIdeas(ideasData);

    } catch (error) {
      console.error("Error fetching session or ideas:", error);
      setError("Error fetching session details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndTopIdeas();

    // Set up real-time subscription for ideas
    const ideasSubscription = supabase
      .channel(`ideas_${sessionId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideas', filter: `session_id=eq.${sessionId}` },
        fetchSessionAndTopIdeas
      )
      .subscribe();

    return () => {
      ideasSubscription.unsubscribe();
    };
  }, [sessionId]);

  const handleIdeaUpdate = (updatedIdea: Idea) => {
    setTopIdeas(prevTopIdeas => {
      const updatedTopIdeas = prevTopIdeas.map(idea => 
        idea.id === updatedIdea.id ? updatedIdea : idea
      );
      return updatedTopIdeas
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 3);
    });
  };

  if (isLoading) return <div>Loading session...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{session.title}</h1>
      <p className="mb-6">{session.prompt}</p>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Top Ideas</h2>
        {topIdeas.length > 0 ? (
          <ul className="space-y-2">
            {topIdeas.map((idea) => (
              <li key={idea.id} className="border p-3 rounded">
                <p>{idea.content}</p>
                <span className="text-sm text-gray-500">Upvotes: {idea.upvotes}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No ideas submitted yet.</p>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-3">All Ideas</h2>
      <IdeaList 
        sessionId={session.id} 
        sessionCreatorId={session.creator_id} 
        onIdeaUpdate={handleIdeaUpdate}
      />
    </div>
  );
}