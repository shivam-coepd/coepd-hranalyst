import "server-only";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  requireRole,
} from "@/lib/auth/guards";

import {
  scheduleInterviewSchema,
  rescheduleInterviewSchema,
  cancelInterviewSchema,
  type ScheduleInterviewInput,
  type RescheduleInterviewInput,
  type CancelInterviewInput,
} from "@/lib/validators/interview.schema";

import {
  getInterviewEligibility,
} from "./interview-eligibility.service";

export async function
scheduleInterview(
  input:
    ScheduleInterviewInput
) {

  await requireRole([
    "client_hr",
  ]);

  const parsed =
    scheduleInterviewSchema
      .parse(input);

  const {
    data: submissionCandidate,
    error:
      submissionCandidateError,
  } =
    await supabaseAdmin
      .from(
        "submission_candidates"
      )
      .select(`
        id,
        application_id,
        status
      `)
      .eq(
        "id",
        parsed
          .submissionCandidateId
      )
      .single();

  if (
    submissionCandidateError ||
    !submissionCandidate
  ) {
    throw new Error(
      "Submitted candidate not found"
    );
  }

  if (
    submissionCandidate.status !==
    "shortlisted"
  ) {
    throw new Error(
      "Candidate must be shortlisted before scheduling an interview"
    );
  }

  const eligibility =
    await getInterviewEligibility(
      submissionCandidate
        .application_id
    );

  if (
    !eligibility.eligible
  ) {
    throw new Error(
      eligibility.reason ??
      "Candidate is not eligible for client interview"
    );
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "schedule_client_interview",
      {
        p_submission_candidate_id:
          parsed
            .submissionCandidateId,

        p_round_number:
          parsed.roundNumber,

        p_round_name:
          parsed.roundName,

        p_interview_type:
          parsed.interviewType,

        p_scheduled_at:
          parsed.scheduledAt,

        p_duration_minutes:
          parsed.durationMinutes,

        p_timezone:
          parsed.timezone,

        p_mode:
          parsed.mode,

        p_meeting_provider:
          parsed
            .meetingProvider ??
          null,

        p_meeting_link:
          parsed.meetingLink ??
          null,

        p_location:
          parsed.location ??
          null,

        p_instructions:
          parsed.instructions ??
          null,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    interviewId:
      data as string,

    mockScore:
      eligibility.mockScore,
  };
}

export async function
rescheduleInterview(
  input:
    RescheduleInterviewInput
) {

  await requireRole([
    "client_hr",
    "admin",
    "super_admin",
  ]);

  const parsed =
    rescheduleInterviewSchema
      .parse(input);

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "reschedule_client_interview",
      {
        p_interview_id:
          parsed.interviewId,

        p_new_scheduled_at:
          parsed.scheduledAt,

        p_new_timezone:
          parsed.timezone,

        p_new_mode:
          parsed.mode,

        p_new_meeting_provider:
          parsed
            .meetingProvider ??
          null,

        p_new_meeting_link:
          parsed.meetingLink ??
          null,

        p_new_location:
          parsed.location ??
          null,

        p_reason:
          parsed.reason,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    success: true,
  };
}

export async function
cancelInterview(
  input:
    CancelInterviewInput
) {

  await requireRole([
    "client_hr",
    "admin",
    "super_admin",
  ]);

  const parsed =
    cancelInterviewSchema
      .parse(input);

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "cancel_client_interview",
      {
        p_interview_id:
          parsed.interviewId,

        p_reason:
          parsed.reason,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    success: true,
  };
}

export async function
completeInterview(
  interviewId:
    string
) {

  await requireRole([
    "client_hr",
    "placement_hr",
    "admin",
    "super_admin",
  ]);

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "complete_client_interview",
      {
        p_interview_id:
          interviewId,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    success: true,
  };
}