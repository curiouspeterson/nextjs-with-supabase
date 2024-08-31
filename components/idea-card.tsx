"use client";

import { useState, useEffect } from "react";
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
  const [supabase, setSupabase] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    import('@/utils/supabase/client').then((module) => {
      setSupabase({
        createClient: module.createClient,
        customFetch: module.customFetch,
      });
    });
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const fetchUserAndCheckUpvote = async () => {
      const { data: { user } } = await supabase.createClient().auth.getUser();
      setCurrentUserId(user?.id || null);

      if (user) {
        const data = await supabase.customFetch(`/upvotes?select=*&idea_id=eq.${idea.id}&user_id=eq.${user.id}`);
        setHasUpvoted(data && data.length > 0);
      }
    };

    const fetchComments = async () => {
      try {
        const data = await supabase.customFetch(`/comments?select=*&idea_id=eq.${idea.id}&order=created_at.asc`);
        setComments(data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchUserAndCheckUpvote();
    fetchComments();
  }, [idea.id, supabase]);

  const handleUpvote = async () => {
    if (!supabase || !currentUserId) return;

    try {
      if (hasUpvoted) {
        await supabase.customFetch(`/upvotes?idea_id=eq.${idea.id}&user_id=eq.${currentUserId}`, {
          method: 'DELETE',
        });
        setUpvotes(prev => prev - 1);
        setHasUpvoted(false);
      } else {
        await supabase.customFetch('/upvotes', {
          method: 'POST',
          body: JSON.stringify({ idea_id: idea.id, user_id: currentUserId }),
        });
        setUpvotes(prev => prev + 1);
        setHasUpvoted(true);
      }

      const updatedIdea = { ...idea, upvotes: hasUpvoted ? upvotes - 1 : upvotes + 1 };
      await supabase.customFetch(`/ideas?id=eq.${idea.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ upvotes: updatedIdea.upvotes }),
      });

      onUpdate(updatedIdea);

    } catch (error) {
      console.error("Error handling upvote:", error);
    }
  };

  const handleDelete = async () => {
    if (!supabase || !currentUserId) return;

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