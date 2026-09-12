import { NextRequest, NextResponse } from "next/server";
import { reviseInterviewFeedback } from "@/services/feedbacks/interview-feedback.service";
import { routeError } from "@/lib/http/route-error";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await reviseInterviewFeedback({
      feedbackId: id,
      rating: body.rating,
      decision: body.decision,
      reasonCode: body.reasonCode,
      comments: body.comments,
      visibleToStudent: body.visibleToStudent ?? true,
      revisionReason: body.revisionReason,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return routeError(error);
  }
}
