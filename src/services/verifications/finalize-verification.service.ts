import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireServiceRole } from "@/lib/auth/service-guard";
import { AppError } from "@/lib/http/route-error";
import {
  verificationSchema,
  type VerificationInput,
} from "@/lib/validators/verification.schema";
export async function finalizeApplicationVerification(
  input: VerificationInput,
) {
  const user = await requireServiceRole([
    "super_admin",
    "admin",
    "placement_hr",
  ]);
  const parsed = verificationSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "finalize_application_verification",
    {
      p_application_id: parsed.applicationId,
      p_user_id: user.id,
      p_decision: parsed.decision,
      p_verified_match_score: parsed.verifiedMatchScore ?? null,
      p_verified_ats_score: parsed.verifiedAtsScore ?? null,
      p_must_have_verified: parsed.mustHaveVerified,
      p_cv_verified: parsed.cvVerified,
      p_experience_verified: parsed.experienceVerified,
      p_domain_verified: parsed.domainVerified,
      p_notes: parsed.notes ?? null,
      p_reason: parsed.rejectionReason ?? null,
      p_update_request: parsed.updateRequest ?? null,
    },
  );
  if (error)
    throw new AppError(error.message, 422, "VERIFICATION_FINALIZE_FAILED");
  return { verificationId: data };
}
