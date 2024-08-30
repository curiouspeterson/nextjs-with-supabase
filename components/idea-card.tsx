"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { ThumbsUp } from "lucide-react";
import { Idea, Comment } from "@/types";
import CommentList from "./comment-list";
import CommentForm from "./comment-form";

export default function IdeaCard({ idea }: { idea: Idea }) {
  const [upvotes, setUpvotes] = useState(idea.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUpvoteStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("upvotes")
          .select("*")
          .eq("idea_id", idea.id)
          .eq("user_id", user.id)
          .single();
        setHasUpvoted(!!data);
      }
    };
    checkUpvoteStatus();
  }, [idea.id]);

  const handleUpvote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (hasUpvoted) {
      const { error } = await supabase
        .from("upvotes")
        .delete()
        .eq("idea_id", idea.id)
        .eq("user_id", user.id);

      if (!error) {
        setUpvotes(upvotes - 1);
        setHasUpvoted(false);
      }
    } else {
      const { error } = await supabase
        .from("upvotes")
        .insert({ idea_id: idea.id, user_id: user.id });

      if (!error) {
        setUpvotes(upvotes + 1);
        setHasUpvoted(true);
      }
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("idea_id", idea.id)
        .order("created_at", { ascending: true });

      if (!error) {
        setComments(data || []);
      }
    }
    setShowComments(!showComments);
  };

  const handleNewComment = (newComment: Comment) => {
    setComments(prevComments => [...prevComments, newComment]);
  };

  return (
    <div className="border rounded-lg p-4">
      <p className="mb-4">{idea.content}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Submitted: {new Date(idea.created_at).toLocaleString()}
        </span>
        <Button onClick={handleUpvote} variant="outline" size="sm">
          <ThumbsUp className={`mr-2 h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
          {upvotes}
        </Button>
      </div>
      <Button onClick={toggleComments} className="mt-2">
        {showComments ? "Hide Comments" : "Show Comments"}
      </Button>
      {showComments && (
        <>
          <CommentList comments={comments} />
          <CommentForm ideaId={idea.id} onCommentAdded={handleNewComment} />
        </>
      )}
    </div>
  );
}