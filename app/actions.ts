"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from '@/utils/supabase/server';
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const origin = headers().get("origin");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name: name,
      },
    },
  });

  if (error) {
    console.error("Sign-up error:", error);
    if (error.message.includes("Email rate limit exceeded")) {
      return encodedRedirect("error", "/sign-up", "Too many sign-up attempts. Please try again later or use a different email address.");
    }
    return encodedRedirect("error", "/sign-up", error.message);
  } else if (data) {
    console.log("Sign-up successful:", data);
    
    // Local development workaround
    if (process.env.NODE_ENV === 'development') {
      // Instead of updating the user, we'll sign them in directly
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Auto sign-in error:", signInError);
        return encodedRedirect("error", "/sign-up", "Sign-up successful, but auto sign-in failed. Please sign in manually.");
      }

      return redirect("/protected");
    }
    
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  } else {
    console.error("Unexpected result: no data and no error");
    return encodedRedirect("error", "/sign-up", "An unexpected error occurred");
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
