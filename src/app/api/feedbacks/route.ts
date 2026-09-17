import { routeError } from "@/lib/http/route-error";
import { NextRequest, NextResponse } from "next/server";

import { submitInterviewFeedback } from "@/services/feedbacks/interview-feedback.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await submitInterviewFeedback(body);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return routeError(error);
  }
}
