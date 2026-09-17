import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { startMockInterview } from "@/services/mocks/mock.service";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await startMockInterview(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return routeError(e);
  }
}
