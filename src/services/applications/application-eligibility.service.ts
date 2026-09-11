import {
  requireRole,
} from "@/lib/auth/guards";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function getApplicationEligibility(
  jobId: string
) {

  const user =
    await requireRole([
      "student",
    ]);

  const {
    data: student,
  } =
    await supabaseAdmin
      .from(
        "student_profiles"
      )
      .select(`
        id,
        verification_status
      `)
      .eq(
        "user_id",
        user.id
      )
      .single();

  if (!student) {
    return {
      eligible: false,
      reason:
        "Student profile not found",
    };
  }

  if (
    student.verification_status !==
    "verified"
  ) {
    return {
      eligible: false,

      reason:
        "Only existing HRAnalyst students can apply",
    };
  }

  const {
    data: job,
  } =
    await supabaseAdmin
      .from("jobs")
      .select(`
        id,
        status,
        application_deadline
      `)
      .eq(
        "id",
        jobId
      )
      .single();

  if (
    !job ||
    job.status !==
    "published"
  ) {
    return {
      eligible: false,
      reason:
        "This job is not available",
    };
  }

  if (
    job.application_deadline &&
    new Date(
      job.application_deadline
    ) <
    new Date()
  ) {
    return {
      eligible: false,
      reason:
        "Application deadline has passed",
    };
  }

  const {
    data: cv,
  } =
    await supabaseAdmin
      .from(
        "student_cvs"
      )
      .select("id")
      .eq(
        "student_id",
        student.id
      )
      .eq(
        "is_primary",
        true
      )
      .is(
        "deleted_at",
        null
      )
      .maybeSingle();

  if (!cv) {
    return {
      eligible: false,
      reason:
        "Upload a CV before applying",
    };
  }

  const {
    data: existing,
  } =
    await supabaseAdmin
      .from(
        "applications"
      )
      .select("id")
      .eq(
        "job_id",
        jobId
      )
      .eq(
        "student_id",
        student.id
      )
      .maybeSingle();

  if (existing) {
    return {
      eligible: false,
      reason:
        "You have already applied for this job",
      applicationId:
        existing.id,
    };
  }

  return {
    eligible: true,
    studentId:
      student.id,
    cvId:
      cv.id,
  };
}