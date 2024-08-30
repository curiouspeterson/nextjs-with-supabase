"use client";

import { useState, useEffect } from "react";
import { createClient, customFetch } from "@/utils/supabase/client";
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const data = await customFetch(`/upvotes?select=*&idea_id=eq.${idea.id}&user_id=eq.${user.id}`);
          setHasUpvoted(data.length > 0);
        }
      } catch (err) {
        console.error("Error checking upvote status:", err);
      }
    };
    checkUpvoteStatus();
  }, [idea.id]);

  const handleUpvote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (hasUpvoted) {
        await customFetch(`/upvotes?idea_id=eq.${idea.id}&user_id=eq.${user.id}`, {
          method: 'DELETE',
        });
        setUpvotes(upvotes - 1);
        setHasUpvoted(false);
      } else {
        await customFetch('/upvotes', {
          method: 'POST',
          body: JSON.stringify({ idea_id: idea.id, user_id: user.id }),
        });
        setUpvotes(upvotes + 1);
        setHasUpvoted(true);
      }
    } catch (error) {
      console.error("Error handling upvote:", error);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      try {
        const data = await customFetch(`/comments?select=*&idea_id=eq.${idea.id}&order=created_at.asc`);
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
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