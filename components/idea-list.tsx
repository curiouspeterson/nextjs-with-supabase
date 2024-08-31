"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import IdeaCard from "@/components/idea-card";
import IdeaForm from "@/components/idea-form";
import { Idea } from "@/types";

interface IdeaListProps {
  sessionId: string;
  sessionCreatorId: string;
  onIdeaUpdate: (updatedIdea: Idea) => void;
  onIdeaDelete: (deletedIdeaId: string) => void;
}

export default function IdeaList({ sessionId, sessionCreatorId, onIdeaUpdate, onIdeaDelete }: IdeaListProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('session_id', sessionId)
        .order('upvotes', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (err) {
      console.error("Error fetching ideas:", err);
      setError("Failed to load ideas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();

    const subscription = supabase
      .channel(`ideas_${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas", filter: `session_id=eq.${sessionId}` }, fetchIdeas)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  const handleNewIdea = (newIdea: Idea) => {
    setIdeas(prevIdeas => [newIdea, ...prevIdeas].sort((a, b) => b.upvotes - a.upvotes));
    onIdeaUpdate(newIdea);
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      const result = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId);

      if (result === null) {
        throw new Error('Unexpected null response from Supabase');
      }

      if (result.error) {
        throw result.error;
      }

      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
      onIdeaDelete(ideaId);
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  };

  const handleIdeaUpdate = (updatedIdea: Idea) => {
    setIdeas(prevIdeas => 
      prevIdeas.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea)
        .sort((a, b) => b.upvotes - a.upvotes)
    );
    onIdeaUpdate(updatedIdea);
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
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              sessionCreatorId={sessionCreatorId}
              onDelete={handleDeleteIdea}
              onUpdate={handleIdeaUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}