import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Hero from "@/components/hero";
import SessionList from "@/components/session-list";

export default async function Index() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch initial sessions
  const { data: initialSessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
  }

  return (
    <>
      <Hero />
      <div className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Active Brainstorming Sessions</h2>
        {error ? (
          <p>Error loading sessions. Please try again later.</p>
        ) : (
          <SessionList initialSessions={initialSessions || []} />
        )}
      </div>
    </>
  );
}
