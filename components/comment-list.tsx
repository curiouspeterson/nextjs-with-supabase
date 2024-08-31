import { useState } from "react";
import { Comment } from "@/types";
import CommentForm from "./comment-form";

interface CommentListProps {
  comments: Comment[];
  ideaId: string;
  onCommentAdded: (newComment: Comment) => void;
}

export default function CommentList({ comments, ideaId, onCommentAdded }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="border-l-2 border-gray-200 pl-4 my-4">
      <p>{comment.content}</p>
      <div className="text-sm text-gray-500 mt-1 flex justify-between items-center">
        <span>{new Date(comment.created_at).toLocaleString()}</span>
        {!comment.parent_comment_id && (
          <button 
            onClick={() => setReplyingTo(comment.id)}
            className="text-blue-500 hover:underline"
          >
            Reply
          </button>
        )}
      </div>
      {replyingTo === comment.id && (
        <CommentForm 
          ideaId={ideaId} 
          parentCommentId={comment.id} 
          onCommentAdded={(newComment) => {
            onCommentAdded(newComment);
            setReplyingTo(null);
          }}
        />
      )}
      {comments
        .filter(c => c.parent_comment_id === comment.id)
        .map(renderComment)}
    </div>
  );

  const topLevelComments = comments.filter(c => !c.parent_comment_id);

  return (
    <div className="mt-4">
      {topLevelComments.map(renderComment)}
    </div>
  );
}