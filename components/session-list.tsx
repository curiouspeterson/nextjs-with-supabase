"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import SessionCard from "@/components/session-card";

export default function SessionList() {
  const [sessions, setSessions] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sessions:", error);
      } else {
        setSessions(data || []);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session: any) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
