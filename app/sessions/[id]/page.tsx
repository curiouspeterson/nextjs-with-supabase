"use client";

import { createClient } from '@supabase/supabase-js';

// Remove the useEffect import if it's present
import IdeaForm from "@/components/idea-form";
import IdeaList from "@/components/idea-list";

// Add this interface to define the shape of the params object
interface SessionDetailProps {
  params: {
    id: string;
  };
}

// Update the function signature to use the new interface
export default async function SessionPage({ params }: SessionDetailProps) {
  // Add these lines to import the environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Add non-null assertions
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch the session data server-side
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    // Handle the error appropriately
    return <div>Error loading session</div>;
  }

  return (
    <div>
      {/* Render your session data here */}
      <h1>Session {session.id}</h1>
      {/* ... other session details ... */}
      <IdeaForm sessionId={session.id} />
      <IdeaList sessionId={session.id} />
    </div>
  );
}