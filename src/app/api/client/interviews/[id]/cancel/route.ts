import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  cancelInterview,
} from "@/services/interviews/interview.service";

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

    await cancelInterview({
      interviewId:
        id,

      reason:
        body.reason,
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to cancel interview",
      },
      {
        status: 400,
      }
    );
  }
}