"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Session, Idea } from "@/types";
import IdeaList from "./idea-list";
import InviteForm from './invite-form';

export default function SessionDetail({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [topIdeas, setTopIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const supabase = createClient();

  const fetchSessionAndTopIdeas = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

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
    fetchSessionAndTopIdeas();
  };

  const handleIdeaDelete = (deletedIdeaId: string) => {
    setTopIdeas(prevTopIdeas => 
      prevTopIdeas.filter(idea => idea.id !== deletedIdeaId)
    );
    fetchSessionAndTopIdeas(); // Refetch to ensure we have the top 3 ideas
  };

  useEffect(() => {
    if (session?.time_limit) {
      const endTime = new Date(session.created_at).getTime() + session.time_limit * 60000;
      const updateTimeRemaining = () => {
        const now = new Date().getTime();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(Math.floor(remaining / 1000));
      };
      
      updateTimeRemaining();
      const timer = setInterval(updateTimeRemaining, 1000);
      
      return () => clearInterval(timer);
    }
  }, [session]);

  if (isLoading) return <div>Loading session...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Session not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{session.title}</h1>
      <p className="mb-6">{session.prompt}</p>
      
      {timeRemaining !== null && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Time Remaining:</h3>
          <p>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
        </div>
      )}
      
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
        onIdeaDelete={handleIdeaDelete}
      />
      
      {session.is_private && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Invite Participants</h3>
          <InviteForm sessionId={session.id} />
        </div>
      )}
    </div>
  );
}