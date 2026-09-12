import { NextResponse } from "next/server";
import { finalizeApplicationVerification } from "@/services/verifications/finalize-verification.service";
import { routeError } from "@/lib/http/route-error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await finalizeApplicationVerification({
      ...body,
      applicationId: id,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return routeError(error);
  }
}
