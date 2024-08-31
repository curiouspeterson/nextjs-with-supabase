"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Idea, Session } from '@/types';

interface DashboardContentProps {
  userId: string;
}

interface IdeaWithSession extends Idea {
  sessions: Session;
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  const [ideas, setIdeas] = useState<IdeaWithSession[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: ideasData, error: ideasError } = await supabase
          .from('ideas')
          .select('*, sessions(*)')
          .eq('creator_id', userId);

        if (ideasError) throw ideasError;
        setIdeas(ideasData as IdeaWithSession[]);

        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('creator_id', userId);

        if (sessionsError) throw sessionsError;
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Your Dashboard</h1>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Ideas</h2>
        {ideas.length === 0 ? (
          <p>You haven't submitted any ideas yet.</p>
        ) : (
          <ul className="space-y-2">
            {ideas.map(idea => (
              <li key={idea.id} className="border p-4 rounded">
                <p>{idea.content}</p>
                <p className="text-sm text-gray-500">
                  Upvotes: {idea.upvotes} | Session: {idea.sessions.title}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Sessions</h2>
        {sessions.length === 0 ? (
          <p>You haven't created any sessions yet.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map(session => (
              <li key={session.id} className="border p-4 rounded">
                <h3 className="font-semibold">{session.title}</h3>
                <p className="text-sm text-gray-500">
                  Created at: {new Date(session.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}