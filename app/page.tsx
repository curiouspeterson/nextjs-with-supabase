import Hero from "@/components/hero";
import SessionList from "@/components/session-list";

export default function Index() {
  return (
    <>
      <Hero />
      <div className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Active Brainstorming Sessions</h2>
        <SessionList />
      </div>
    </>
  );
}
