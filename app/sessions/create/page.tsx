"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function CreateSession() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!userId) {
      setError("You must be logged in to create a session");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert([{ 
          title, 
          prompt, 
          creator_id: userId,
          time_limit: timeLimit,
          is_private: isPrivate
        }])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        const sessionId = data[0].id;
        
        if (isPrivate && inviteEmails.length > 0) {
          const invitations = inviteEmails.map(email => ({
            session_id: sessionId,
            email
          }));
          
          const { error: inviteError } = await supabase
            .from("session_invitations")
            .insert(invitations);
          
          if (inviteError) throw inviteError;
        }
        
        router.push(`/sessions/${sessionId}`);
      } else {
        throw new Error("No data returned after creating session");
      }
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create session. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create a New Brainstorming Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-2">
            Session Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="prompt" className="block mb-2">
            Session Prompt
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="timeLimit" className="block mb-2">
            Time Limit (minutes, optional)
          </label>
          <Input
            id="timeLimit"
            type="number"
            value={timeLimit || ""}
            onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
            min="1"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isPrivate"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
          />
          <label htmlFor="isPrivate">Private Session</label>
        </div>
        
        {isPrivate && (
          <div>
            <label htmlFor="inviteEmails" className="block mb-2">
              Invite Emails (comma-separated)
            </label>
            <Input
              id="inviteEmails"
              value={inviteEmails.join(", ")}
              onChange={(e) => setInviteEmails(e.target.value.split(",").map(email => email.trim()))}
              placeholder="email1@example.com, email2@example.com"
            />
          </div>
        )}
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Session"}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}