"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export default function IdeaForm({ sessionId }) {
  const [content, setContent] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("ideas")
      .insert([{ session_id: sessionId, content }]);

    if (error) {
      console.error("Error submitting idea:", error);
    } else {
      setContent("");
      // Optionally, you can trigger a refresh of the idea list here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your idea..."
        className="mb-4"
        required
      />
      <Button type="submit">Submit Idea</Button>
    </form>
  );
}