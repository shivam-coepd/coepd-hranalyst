import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { setPrimaryCv } from "@/services/cv/set-primary.service";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await setPrimaryCv(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return routeError(e);
  }
}
