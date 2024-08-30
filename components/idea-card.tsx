"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { ThumbsUp } from "lucide-react";

export default function IdeaCard({ idea }) {
  const [upvotes, setUpvotes] = useState(idea.upvotes);
  const supabase = createClient();

  const handleUpvote = async () => {
    const { data, error } = await supabase
      .from("ideas")
      .update({ upvotes: upvotes + 1 })
      .eq("id", idea.id)
      .select();

    if (error) {
      console.error("Error upvoting idea:", error);
    } else {
      setUpvotes(data[0].upvotes);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <p className="mb-4">{idea.content}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Submitted: {new Date(idea.created_at).toLocaleString()}
        </span>
        <Button onClick={handleUpvote} variant="outline" size="sm">
          <ThumbsUp className="mr-2 h-4 w-4" />
          {upvotes}
        </Button>
      </div>
    </div>
  );
}