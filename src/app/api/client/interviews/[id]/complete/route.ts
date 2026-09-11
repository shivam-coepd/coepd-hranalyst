import {
  NextResponse,
} from "next/server";

import {
  completeInterview,
} from "@/services/interviews/interview.service";

export async function POST(
  _request:
    Request,
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

    await completeInterview(
      id
    );

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
            : "Unable to complete interview",
      },
      {
        status: 400,
      }
    );
  }
}