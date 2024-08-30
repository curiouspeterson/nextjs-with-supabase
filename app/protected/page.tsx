import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProtectedPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: userSessions, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user sessions:", error);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center">
      <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Your Brainstorming Sessions</h2>
        {userSessions && userSessions.length > 0 ? (
          <ul className="space-y-4">
            {userSessions.map((session) => (
              <li key={session.id} className="border p-4 rounded-md">
                <Link href={`/sessions/${session.id}`} className="text-blue-500 hover:underline">
                  {session.title}
                </Link>
                <p className="text-sm text-gray-500">Created: {new Date(session.created_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven't created any brainstorming sessions yet.</p>
        )}
        <Link href="/sessions/create" className="mt-6 inline-block bg-blue-500 text-white px-4 py-2 rounded-md">
          Create New Session
        </Link>
      </div>
    </div>
  );
}
