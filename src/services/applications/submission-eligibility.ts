import {
  CLIENT_SUBMISSION_MATCH_THRESHOLD,
} from "@/lib/applications/constants";

export function getSubmissionEligibility({
  status,
  matchScore,
}: {
  status: string;
  matchScore:
    number | null;
}) {

  if (
    status !== "verified"
  ) {
    return {
      eligible: false,
      reason:
        "Application must be verified first",
    };
  }

  if (
    matchScore === null
  ) {
    return {
      eligible: false,
      reason:
        "Match score is unavailable",
    };
  }

  if (
    matchScore <
    CLIENT_SUBMISSION_MATCH_THRESHOLD
  ) {
    return {
      eligible: false,

      reason:
        `Minimum ${CLIENT_SUBMISSION_MATCH_THRESHOLD}% match is required`,
    };
  }

  return {
    eligible: true,
  };
}