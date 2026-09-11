import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  decideClientCandidate,
} from "@/services/client/client-decision.service";

export async function POST(
  request:
    NextRequest,
  context: {
    params:
      Promise<{
        id: string;
      }>;
  }
) {

  try {

    const {
      id,
    } =
      await context.params;

    const body =
      await request.json();

    const result =
      await decideClientCandidate({
        submissionCandidateId:
          id,

        decision:
          body.decision,

        reasonCode:
          body.reasonCode,

        reason:
          body.reason,
      });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Unable to save decision";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}