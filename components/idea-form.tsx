"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Idea } from "@/types";

interface IdeaFormProps {
  sessionId: string;
  onIdeaAdded: (newIdea: Idea) => void;
}

export default function IdeaForm({ sessionId, onIdeaAdded }: IdeaFormProps) {
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!userId) {
      setError("You must be logged in to submit an idea");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("ideas")
        .insert([{ session_id: sessionId, content, creator_id: userId }])
        .select()
        .single();

      if (error) {
        console.error("Error submitting idea:", error);
        setError("Failed to submit idea. Please try again.");
      } else if (data) {
        setContent("");
        onIdeaAdded(data as Idea);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
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
      <Button type="submit" disabled={isSubmitting || !userId}>
        {isSubmitting ? "Submitting..." : "Submit Idea"}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {!userId && <p className="text-yellow-500 mt-2">Please log in to submit ideas.</p>}
    </form>
  );
}