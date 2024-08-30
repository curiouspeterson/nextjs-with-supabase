"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import SessionCard from "@/components/session-card";
import { Session } from "@/types";

export default function SessionList({ initialSessions = [] }: { initialSessions: Session[] }) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const subscription = supabase
      .channel('public:sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, handleChange)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleChange = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Error fetching sessions");
    } else {
      setSessions(data || []);
    }
    setIsLoading(false);
  };

  if (isLoading) return <div>Updating sessions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.length === 0 ? (
        <p>No active sessions found.</p>
      ) : (
        sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))
      )}
    </div>
  );
}
