import { NextResponse } from "next/server";
import { createSubmittedCvSignedUrl } from "@/services/submissions/client-cv-access.service";
import { routeError } from "@/lib/http/route-error";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await createSubmittedCvSignedUrl(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return routeError(error);
  }
}
