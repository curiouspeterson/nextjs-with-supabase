export interface Session {
  id: string;
  title: string;
  prompt: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  session_id: string;
  content: string;
  upvotes: number;
  created_at: string;
}

export interface Comment {
  id: string;
  idea_id: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
}