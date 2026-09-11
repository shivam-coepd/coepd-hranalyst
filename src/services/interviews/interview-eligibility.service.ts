import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export interface InterviewEligibility {
  eligible: boolean;
  reason: string | null;
  completedMockId: string | null;
  mockScore: number | null;
}

export async function
getInterviewEligibility(
  applicationId: string
): Promise<InterviewEligibility> {

  const {
    data: application,
    error: applicationError,
  } =
    await supabaseAdmin
      .from("applications")
      .select(`
        id,
        status
      `)
      .eq(
        "id",
        applicationId
      )
      .single();

  if (
    applicationError ||
    !application
  ) {
    return {
      eligible: false,
      reason:
        "Application not found",
      completedMockId:
        null,
      mockScore:
        null,
    };
  }

  if (
    application.status !==
      "shortlisted"
    &&
    application.status !==
      "mock_completed"
  ) {
    return {
      eligible: false,
      reason:
        "Candidate must be shortlisted before client interview scheduling",
      completedMockId:
        null,
      mockScore:
        null,
    };
  }

  const {
    data: mocks,
    error: mockError,
  } =
    await supabaseAdmin
      .from(
        "mock_interviews"
      )
      .select(`
        id,
        completed_at,
        mock_scorecards!inner (
          overall_score,
          status
        )
      `)
      .eq(
        "application_id",
        applicationId
      )
      .eq(
        "status",
        "completed"
      )
      .order(
        "completed_at",
        {
          ascending:
            false,
        }
      )
      .limit(1);

  if (
    mockError ||
    !mocks ||
    mocks.length === 0
  ) {
    return {
      eligible: false,

      reason:
        "Mock interview must be completed before the client interview",

      completedMockId:
        null,

      mockScore:
        null,
    };
  }

  const mock =
    mocks[0];

  const scorecard =
    Array.isArray(
      mock.mock_scorecards
    )
      ? mock
          .mock_scorecards[0]
      : mock.mock_scorecards;

  if (
    !scorecard ||
    scorecard.status !==
      "submitted"
  ) {
    return {
      eligible: false,

      reason:
        "Mock scorecard must be submitted before the client interview",

      completedMockId:
        null,

      mockScore:
        null,
    };
  }

  return {
    eligible: true,
    reason: null,
    completedMockId:
      mock.id,
    mockScore:
      Number(
        scorecard.overall_score
      ),
  };
}