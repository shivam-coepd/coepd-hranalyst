import "server-only";

import { createClient } from "@/lib/supabase/server";

import { requireRole } from "@/lib/auth/guards";
import { queueNotification } from "@/services/notifications/queue.service";
import { supabaseAdmin } from "@/lib/supabase/admin";

import {
  clientDecisionSchema,
  type ClientDecisionInput,
} from "@/lib/validators/client-decision.schema";

export async function decideClientCandidate(input: ClientDecisionInput) {
  await requireRole(["client_hr"]);

  const parsed = clientDecisionSchema.parse(input);

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("client_decide_candidate", {
    p_submission_candidate_id: parsed.submissionCandidateId,

    p_decision: parsed.decision,

    p_reason_code: parsed.reasonCode ?? undefined,

    p_reason: parsed.reason ?? undefined,
  });

  if (error) {
    throw new Error(error.message);
  }


  if (parsed.decision === "shortlisted") {
    // get student_id
    const { data: candidateInfo } = await supabaseAdmin
      .from("client_submission_candidates")
      .select("job_applications(student_id)")
      .eq("id", parsed.submissionCandidateId)
      .single();
    
    if (candidateInfo && candidateInfo.job_applications) {
      const studentId = Array.isArray(candidateInfo.job_applications) 
        ? candidateInfo.job_applications[0].student_id 
        : candidateInfo.job_applications.student_id;

      if (studentId) {
        await queueNotification({
          eventType: "CLIENT_CANDIDATE_SHORTLISTED",
          channel: "email",
          recipientUserId: studentId,
          entityType: "client_decision",
          entityId: data as string,
        });
      }
    }

    // to Admin
    const { data: adminRoles } = await supabaseAdmin.from("roles").select("id").in("name", ["admin", "super_admin"]);
    if (adminRoles && adminRoles.length > 0) {
      const { data: admins } = await supabaseAdmin
        .from("user_roles")
        .select("user_id")
        .in("role_id", adminRoles.map(r => r.id));
      if (admins) {
        for (const adminUser of admins) {
          await queueNotification({
            eventType: "HRANALYST_UPDATE",
            channel: "email",
            recipientUserId: adminUser.user_id,
            entityType: "client_decision",
            entityId: data as string,
            payload: { message: "A client has shortlisted a candidate." }
          });
        }
      }
    }
  }

  return {
    decisionId: data as string,
  };
}
