import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export const customFetch = async (path: string, options: RequestInit = {}) => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API request failed: ${res.status} ${res.statusText} - ${errorText}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

export default {
  createClient,
  customFetch,
};
