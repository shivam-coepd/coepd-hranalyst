import { NextResponse } from "next/server";
import { claimApplicationVerification } from "@/services/verifications/claim-application.service";
import { routeError } from "@/lib/http/route-error";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await claimApplicationVerification(id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return routeError(error);
  }
}
