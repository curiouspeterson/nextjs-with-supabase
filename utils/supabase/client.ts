import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export const customFetch = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('API request failed');
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export default {
  createClient,
  customFetch,
};
