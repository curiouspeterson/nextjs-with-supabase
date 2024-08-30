"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Comment } from "@/types";

interface CommentFormProps {
  ideaId: string;
  parentCommentId?: string;
  onCommentAdded: (newComment: Comment) => void;
}

export default function CommentForm({ ideaId, parentCommentId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        idea_id: ideaId,
        content,
        parent_comment_id: parentCommentId,
        creator_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting comment:", error);
    } else if (data) {
      setContent("");
      onCommentAdded(data);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="mb-2"
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Comment"}
      </Button>
    </form>
  );
}