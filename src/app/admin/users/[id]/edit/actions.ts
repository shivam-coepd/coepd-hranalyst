"use server";
import { redirect } from "next/navigation";
import { updateUser } from "@/services/users/update-user.service";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type EditUserState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  fields?: Record<string, string>;
};

export async function updateUserAction(
  userId: string,
  _: EditUserState,
  fd: FormData,
): Promise<EditUserState> {
  const raw = Object.fromEntries(fd.entries()) as Record<string, string>;

  // Basic validation
  const errors: Record<string, string[]> = {};
  if (!raw.firstName?.trim()) errors.firstName = ["First name is required"];
  if (!raw.lastName?.trim()) errors.lastName = ["Last name is required"];

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please correct the highlighted information",
      fieldErrors: errors,
      fields: raw,
    };
  }

  try {
    await updateUser(userId, {
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      phone: raw.phone?.trim() || "",
    });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to update user",
      fields: raw,
    };
  }

  redirect(`/admin/users/${userId}`);
}
