import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function applyToJob(jobId: string) {
  const user = await requireRole(["student"]);

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.account_status !== "approved") {
    throw new Error("Your account is not approved");
  }

  const { data: student } = await supabaseAdmin
    .from("student_profiles")
    .select(
      `
        id,
        verification_status
      `,
    )
    .eq("user_id", user.id)
    .single();

  if (!student) {
    throw new Error("Student profile not found");
  }

  if (student.verification_status !== "verified") {
    throw new Error("Only existing HRAnalyst students can apply");
  }

  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select(
      `
        id,
        status,
        application_deadline
      `,
    )
    .eq("id", jobId)
    .single();

  if (!job || job.status !== "published") {
    throw new Error("Job is not available");
  }

  if (
    job.application_deadline &&
    new Date(job.application_deadline) < new Date()
  ) {
    throw new Error("Application deadline has passed");
  }

  const { data: cv } = await supabaseAdmin
    .from("student_cvs")
    .select(
      `
        id,
        parsing_status
      `,
    )
    .eq("student_id", student.id)
    .eq("is_primary", true)
    .is("deleted_at", null)
    .single();

  if (!cv) {
    throw new Error("Upload a CV before applying");
  }

  const { data: checklist } = await supabaseAdmin
    .from("job_checklists")
    .select("id")
    .eq("job_id", jobId)
    .eq("status", "approved")
    .single();

  if (!checklist) {
    throw new Error("Job checklist is unavailable");
  }

  const { data: application, error } = await supabaseAdmin
    .from("applications")
    .insert({
      job_id: jobId,

      student_id: student.id,

      cv_id: cv.id,

      checklist_id: checklist.id,

      status: "scoring_pending",

      score_status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already applied for this job");
    }

    throw new Error(error.message);
  }

  await supabaseAdmin.from("notification_jobs").insert({
    event_type: "APPLICATION_CREATED",

    entity_type: "application",

    entity_id: application.id,

    channel: "in_app",

    payload: {
      application_id: application.id,

      job_id: jobId,
    },
  });

  await Promise.all([
    supabaseAdmin.from("application_status_history").insert({
      application_id: application.id,

      old_status: null,

      new_status: "scoring_pending",

      changed_by: user.id,

      metadata: {
        cv_id: cv.id,

        checklist_id: checklist.id,
      },
    }),

    supabaseAdmin.from("audit_logs").insert({
      actor_user_id: user.id,

      entity_type: "application",

      entity_id: application.id,

      action: "APPLICATION_CREATED",

      new_data: {
        job_id: jobId,

        cv_id: cv.id,

        checklist_id: checklist.id,
      },
    }),
  ]);

  return application;
}
