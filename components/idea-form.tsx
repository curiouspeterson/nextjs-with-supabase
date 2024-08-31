"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Idea } from "@/types";

interface IdeaFormProps {
  sessionId: string;
  onIdeaAdded: (newIdea: Idea) => void;
  isDisabled: boolean;
}

export default function IdeaForm({ sessionId, onIdeaAdded, isDisabled }: IdeaFormProps) {
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
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
      let imagePath = null;
      if (image) {
        const { data, error } = await supabase.storage
          .from('idea-images')
          .upload(`${sessionId}/${Date.now()}-${image.name}`, image);
        
        if (error) throw error;
        imagePath = data.path;
      }

      const { data, error } = await supabase
        .from("ideas")
        .insert([{ session_id: sessionId, content, creator_id: userId, image_path: imagePath }])
        .select()
        .single();

      if (error) {
        console.error("Error submitting idea:", error);
        setError("Failed to submit idea. Please try again.");
      } else if (data) {
        setContent("");
        setImage(null);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your idea"
        required
      />
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
      <Button type="submit" disabled={isSubmitting || isDisabled}>
        {isSubmitting ? "Submitting..." : (isDisabled ? "Waiting for round to start" : "Submit Idea")}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}