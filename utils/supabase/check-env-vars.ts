export const hasEnvVars = (): boolean => {
  // Check for necessary environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    // Add other required env vars here
  ];

  return requiredEnvVars.every(varName => !!process.env[varName]);
};
