"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { ThumbsUp, Trash2 } from "lucide-react";
import { Idea, Comment } from "@/types";
import CommentList from "./comment-list";
import CommentForm from "./comment-form";

interface IdeaCardProps {
  idea: Idea;
  sessionCreatorId: string;
  onDelete: (ideaId: string) => void;
  onUpdate: (updatedIdea: Idea) => void;
}

export default function IdeaCard({ idea, sessionCreatorId, onDelete, onUpdate }: IdeaCardProps) {
  const [upvotes, setUpvotes] = useState(idea.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndCheckUpvote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (user) {
        const { data, error } = await supabase
          .from("upvotes")
          .select("*")
          .eq("idea_id", idea.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking upvote status:", error);
        } else {
          setHasUpvoted(!!data);
        }
      }
    };

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("idea_id", idea.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
      } else {
        setComments(data || []);
      }
    };

    fetchUserAndCheckUpvote();
    fetchComments();
  }, [idea.id, supabase]);

  const handleUpvote = async () => {
    if (!currentUserId) return;

    try {
      if (hasUpvoted) {
        const { error } = await supabase
          .from("upvotes")
          .delete()
          .eq("idea_id", idea.id)
          .eq("user_id", currentUserId);

        if (error) throw error;
        setUpvotes(prev => prev - 1);
        setHasUpvoted(false);
      } else {
        const { error } = await supabase
          .from("upvotes")
          .insert({ idea_id: idea.id, user_id: currentUserId });

        if (error) throw error;
        setUpvotes(prev => prev + 1);
        setHasUpvoted(true);
      }

      const updatedIdea = { ...idea, upvotes: hasUpvoted ? upvotes - 1 : upvotes + 1 };
      const { error } = await supabase
        .from("ideas")
        .update({ upvotes: updatedIdea.upvotes })
        .eq("id", idea.id);

      if (error) throw error;
      onUpdate(updatedIdea);
    } catch (error) {
      console.error("Error handling upvote:", error);
    }
  };

  const handleDelete = async () => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from("ideas")
        .delete()
        .eq("id", idea.id);

      if (error) throw error;
      onDelete(idea.id);
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  };

  const handleNewComment = (newComment: Comment) => {
    setComments(prevComments => [...prevComments, newComment]);
  };

  const canDelete = currentUserId && (currentUserId === idea.creator_id || currentUserId === sessionCreatorId);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <p className="flex-grow">{idea.content}</p>
        <div className="flex items-center">
          <Button onClick={handleUpvote} variant="outline" size="sm" className="mr-2">
            <ThumbsUp className={`mr-2 h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
            {upvotes}
          </Button>
          {canDelete && (
            <Button onClick={handleDelete} variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Comments</h3>
        <CommentList comments={comments} ideaId={idea.id} onCommentAdded={handleNewComment} />
        <CommentForm ideaId={idea.id} onCommentAdded={handleNewComment} />
      </div>
    </div>
  );
}