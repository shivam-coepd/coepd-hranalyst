import { NextResponse } from "next/server";
import { releaseApplicationVerification } from "@/services/verifications/claim-application.service";
import { routeError } from "@/lib/http/route-error";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await releaseApplicationVerification(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return routeError(error);
  }
}
