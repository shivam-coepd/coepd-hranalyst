"use server";

import { redirect } from "next/navigation";
import { createUserSchema } from "@/lib/validators/create-user.schema";
import { createUser } from "@/services/users/create-user.service";

export interface CreateUserState {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createUserAction(
  _previousState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const parsed = createUserSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    enrollmentId: formData.get("enrollmentId"),
    companyId: formData.get("companyId"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted information",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await createUser(parsed.data);
    redirect(`/admin/users/${result.userId}`);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to create user",
    };
  }
}
