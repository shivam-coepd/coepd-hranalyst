import { NextRequest, NextResponse } from "next/server";

import { decideClientCandidate } from "@/services/client/client-decision.service";
import { routeError } from "@/lib/http/route-error";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const result = await decideClientCandidate({
      submissionCandidateId: id,

      decision: body.decision,

      reasonCode: body.reasonCode,

      reason: body.reason,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return routeError(error);
  }
}
