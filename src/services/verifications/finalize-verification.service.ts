import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireServiceRole } from "@/lib/auth/service-guard";
import { AppError } from "@/lib/http/route-error";
import { queueNotification } from "@/services/notifications/queue.service";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
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

  // 1. Fetch application and job details from the "applications" table
  const { data: application, error: appError } = await supabaseAdmin
    .from("applications")
    .select("student_id, jobs(title, company_name, assigned_placement_hr)")
    .eq("id", parsed.applicationId)
    .single();

  if (appError || !application) {
    throw new AppError("Application not found", 404, "APPLICATION_NOT_FOUND");
  }

  // 2. Authorization: Placement HR can only finalize verification for their assigned jobs (admins can finalize all)
  const isElevated = user.roles.some((r) => r === "admin" || r === "super_admin");
  const job = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs;

  if (!isElevated && job?.assigned_placement_hr && job.assigned_placement_hr !== user.id) {
    throw new AppError(
      "This application is assigned to another HR",
      403,
      "FORBIDDEN",
    );
  }

  // 3. Finalize verification RPC
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "finalize_application_verification",
    {
      p_application_id: parsed.applicationId,
      p_decision: parsed.decision,
      p_verified_match_score: parsed.verifiedMatchScore ?? undefined,
      p_verified_ats_score: parsed.verifiedAtsScore ?? undefined,
      p_must_have_verified: parsed.mustHaveVerified,
      p_cv_verified: parsed.cvVerified,
      p_experience_verified: parsed.experienceVerified,
      p_domain_verified: parsed.domainVerified,
      p_notes: parsed.notes ?? undefined,
      p_reason: parsed.rejectionReason ?? undefined,
      p_update_request: parsed.updateRequest ?? undefined,
    },
  );

  if (error) {
    throw new AppError(error.message, 422, "VERIFICATION_FINALIZE_FAILED");
  }

  // 4. Audit Log
  await writeAuditLog({
    actorUserId: user.id,
    entityType: "application",
    entityId: parsed.applicationId,
    action: `VERIFICATION_${parsed.decision.toUpperCase()}`,
    newData: {
      decision: parsed.decision,
      verifiedMatchScore: parsed.verifiedMatchScore,
      verifiedAtsScore: parsed.verifiedAtsScore,
      notes: parsed.notes,
      reason: parsed.rejectionReason,
      updateRequest: parsed.updateRequest,
    },
  }).catch((err) => console.error("Audit log failed for verification:", err));

  // 5. Notify Student (both in_app and email channels)
  if (application.student_id) {
    const jobTitle = job?.title || "your applied position";
    const companyName = job?.company_name || "the company";

    try {
      if (parsed.decision === "verified") {
        const payload = {
          job_title: jobTitle,
          company_name: companyName,
          application_id: parsed.applicationId,
        };
        await queueNotification({
          eventType: "APPLICATION_VERIFIED",
          channel: "email",
          recipientUserId: application.student_id,
          entityType: "application",
          entityId: parsed.applicationId,
          payload,
        });
        await queueNotification({
          eventType: "APPLICATION_VERIFIED",
          channel: "in_app",
          recipientUserId: application.student_id,
          entityType: "application",
          entityId: parsed.applicationId,
          payload,
        });
      } else if (parsed.decision === "rejected") {
        const payload = {
          job_title: jobTitle,
          company_name: companyName,
          application_id: parsed.applicationId,
          reason: parsed.rejectionReason || "Verification criteria not met",
        };
        await queueNotification({
          eventType: "APPLICATION_REJECTED",
          channel: "email",
          recipientUserId: application.student_id,
          entityType: "application",
          entityId: parsed.applicationId,
          payload,
        });
        await queueNotification({
          eventType: "APPLICATION_REJECTED",
          channel: "in_app",
          recipientUserId: application.student_id,
          entityType: "application",
          entityId: parsed.applicationId,
          payload,
        });
      } else if (parsed.decision === "update_requested") {
        const payload = {
          job_title: jobTitle,
          company_name: companyName,
          application_id: parsed.applicationId,
          update_request: parsed.updateRequest || "Please update your CV/details",
        };
        await queueNotification({
          eventType: "APPLICATION_UPDATE_REQUESTED",
          channel: "email",
          recipientUserId: application.student_id,
          entityType: "application",
          entityId: parsed.applicationId,
          payload,
        });
        await queueNotification({
          eventType: "APPLICATION_UPDATE_REQUESTED",
          channel: "in_app",
          recipientUserId: application.student_id,
          entityType: "application",
          entityId: parsed.applicationId,
          payload,
        });
      }
    } catch (notifErr) {
      console.error("Failed to queue student verification notifications:", notifErr);
    }
  }

  return { verificationId: data };
}
