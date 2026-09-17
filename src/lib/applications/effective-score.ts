export function getEffectiveScore(
  verifiedScore: number | null | undefined,
  automatedScore: number | null | undefined,
) {
  if (verifiedScore !== null && verifiedScore !== undefined) {
    return Number(verifiedScore);
  }

  if (automatedScore !== null && automatedScore !== undefined) {
    return Number(automatedScore);
  }

  return null;
}

export function isClientSubmissionEligible(
  status: string,
  verifiedMatchScore: number | null | undefined,
  matchScore: number | null | undefined,
) {
  if (status !== "verified") {
    return {
      eligible: false,

      reason: "Candidate must be verified",
    };
  }

  const effective = getEffectiveScore(verifiedMatchScore, matchScore);

  if (effective === null) {
    return {
      eligible: false,

      reason: "Match score is unavailable",
    };
  }

  if (effective < 60) {
    return {
      eligible: false,

      reason: "Minimum 60% match score required",
    };
  }

  return {
    eligible: true,

    reason: null,

    effectiveMatchScore: effective,
  };
}
