"use server";

import { createClient } from "@/lib/supabase/server";

export async function forgotPasswordAction(
  _previousState: {
    success: boolean;
    message: string;
  },
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return {
      success: false,
      message: "Email is required",
      fields: { email },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Unable to send password reset email",
      fields: { email },
    };
  }

  return {
    success: true,
    message:
      "If the account exists, password reset instructions have been sent.",
  };
}
