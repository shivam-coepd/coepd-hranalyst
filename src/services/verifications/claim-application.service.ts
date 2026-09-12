import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireServiceRole } from "@/lib/auth/service-guard";
import { AppError } from "@/lib/http/route-error";
export async function claimApplicationVerification(applicationId: string) {
  const user = await requireServiceRole([
    "super_admin",
    "admin",
    "placement_hr",
  ]);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_application_verification", {
    p_application_id: applicationId,
    p_user_id: user.id,
  });
  if (error)
    throw new AppError(error.message, 409, "VERIFICATION_CLAIM_FAILED");
  return { assignmentId: data, claimedBy: user.id };
}
export async function releaseApplicationVerification(applicationId: string) {
  const user = await requireServiceRole([
    "super_admin",
    "admin",
    "placement_hr",
  ]);
  const supabase = await createClient();
  const { error } = await supabase.rpc("release_application_verification", {
    p_application_id: applicationId,
    p_user_id: user.id,
    p_reason: "Manual release from dashboard",
  });
  if (error)
    throw new AppError(error.message, 409, "VERIFICATION_RELEASE_FAILED");
}
