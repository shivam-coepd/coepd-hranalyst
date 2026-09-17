import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { getCvDownloadUrl } from "@/services/cv/set-primary.service";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = await getCvDownloadUrl(id);
    return NextResponse.redirect(url);
  } catch (e) {
    return routeError(e);
  }
}
