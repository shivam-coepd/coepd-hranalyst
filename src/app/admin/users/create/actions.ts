"use server";

import { redirect } from "next/navigation";
import { createUserSchema } from "@/lib/validators/create-user.schema";
import { createUser } from "@/services/users/create-user.service";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export interface CreateUserState {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  fields?: Record<string, string>;
}

export async function createUserAction(
  _previousState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  
  const parsed = createUserSchema.safeParse({
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    password: raw.password,
    phone: raw.phone || undefined,
    role: raw.role,
    location: raw.location || undefined,
    batchDate: raw.batchDate || undefined,
    companyId: raw.companyId || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted information",
      fieldErrors: parsed.error.flatten().fieldErrors,
      fields: raw,
    };
  }

  let userId: string | undefined;

  try {
    const result = await createUser(parsed.data);
    userId = result.userId;
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to create user",
      fields: raw,
    };
  }

  // Redirect must be called outside the try/catch block because Next.js
  // throws an internal error to trigger the redirect, which would otherwise be caught.
  if (userId) {
    redirect(`/admin/users/${userId}`);
  }
  
  return { success: false, message: "An unexpected error occurred" };
}
