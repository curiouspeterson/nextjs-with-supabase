import Link from "next/link";

export default function SessionCard({ session }) {
  return (
    <Link href={`/sessions/${session.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {session.prompt}
        </p>
        <p className="text-xs text-gray-500">
          Created: {new Date(session.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
