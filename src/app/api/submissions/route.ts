import { NextRequest, NextResponse } from "next/server";
import { createClientSubmission } from "@/services/submissions/submission.service";
import { routeError } from "@/lib/http/route-error";
export async function POST(request: NextRequest) {
  try {
    const result = await createClientSubmission(await request.json());
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
