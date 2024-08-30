import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import SessionList from "@/components/session-list";

export default async function SessionsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch sessions from Supabase
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Brainstorming Sessions</h1>
      {error ? (
        <p>Error loading sessions. Please try again later.</p>
      ) : (
        <SessionList initialSessions={sessions || []} />
      )}
    </div>
  )
}