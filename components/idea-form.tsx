"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function IdeaForm({ sessionId }: { sessionId: string }) {
  const supabase = createClient();

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error } = await supabase
      .from("ideas")
      .insert([{ session_id: sessionId, content }]);

    if (error) {
      console.error("Error submitting idea:", error);
      setError("Failed to submit idea. Please try again.");
    } else {
      setContent("");
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your idea..."
        className="mb-4"
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Idea"}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}