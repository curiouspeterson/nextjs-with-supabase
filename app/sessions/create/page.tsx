"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateSession() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert([{ title, prompt }])
        .select();

      if (error) {
        console.error("Error creating session:", error);
        setError(`Failed to create session: ${error.message}`);
        setIsSubmitting(false);
      } else if (data && data.length > 0) {
        router.push(`/sessions/${data[0].id}`);
      } else {
        setError("No data returned after creating session");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create a New Brainstorming Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-2">
            Session Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="prompt" className="block mb-2">
            Session Prompt
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Session"}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}