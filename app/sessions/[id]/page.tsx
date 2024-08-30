import SessionDetail from "@/components/session-detail";

export default function SessionPage({ params }: { params: { id: string } }) {
  return <SessionDetail sessionId={params.id} />;
}