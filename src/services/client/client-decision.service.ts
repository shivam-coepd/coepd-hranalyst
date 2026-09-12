import "server-only";

import { createClient } from "@/lib/supabase/server";

import { requireRole } from "@/lib/auth/guards";

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

  return {
    decisionId: data as string,
  };
}
