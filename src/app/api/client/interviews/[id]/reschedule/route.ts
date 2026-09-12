import { routeError } from "@/lib/http/route-error";
import { NextRequest, NextResponse } from "next/server";

import { rescheduleInterview } from "@/services/interviews/interview.service";

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

    await rescheduleInterview({
      interviewId: id,

      scheduledAt: body.scheduledAt,

      timezone: body.timezone,

      mode: body.mode,

      meetingProvider: body.meetingProvider,

      meetingLink: body.meetingLink,

      location: body.location,

      reason: body.reason,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return routeError(error);
  }
}
