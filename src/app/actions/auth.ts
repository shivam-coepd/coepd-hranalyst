"use server";

import { createClient } from "@/lib/supabase/server";

export async function changeMyPasswordAction(oldPassword: string, newPassword: string) {
  if (oldPassword === newPassword) {
    return {
      success: false,
      message: "New password cannot be the same as the old password",
    };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters",
    };
  }

  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    return { success: false, message: "Unable to verify current user" };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });

  if (signInError) {
    return { success: false, message: "Incorrect old password" };
  }
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return { success: true };
}
