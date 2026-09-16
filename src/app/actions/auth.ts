"use server";

import { createClient } from "@/lib/supabase/server";

export async function changeMyPasswordAction(newPassword: string) {
  if (newPassword.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters",
    };
  }

  const supabase = await createClient();
  
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
