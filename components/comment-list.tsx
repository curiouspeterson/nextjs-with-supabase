import { Comment } from "@/types";

export default function CommentList({ comments }: { comments: Comment[] }) {
  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="ml-4 mt-2">
      <p>{comment.content}</p>
      <span className="text-xs text-gray-500">
        {new Date(comment.created_at).toLocaleString()}
      </span>
    </div>
  );

  const renderCommentThread = (comment: Comment) => (
    <div key={comment.id}>
      {renderComment(comment)}
      {comments
        .filter(c => c.parent_comment_id === comment.id)
        .map(renderCommentThread)}
    </div>
  );

  const topLevelComments = comments.filter(c => !c.parent_comment_id);

  return (
    <div className="mt-4">
      {topLevelComments.map(renderCommentThread)}
    </div>
  );
}