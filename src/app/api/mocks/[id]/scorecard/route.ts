import { NextRequest, NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { submitMockScorecard } from "@/services/mocks/mock.service";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const scorecardId = await submitMockScorecard({ ...body, mockId: id });
    return NextResponse.json({ success: true, scorecardId });
  } catch (e) {
    return routeError(e);
  }
}
