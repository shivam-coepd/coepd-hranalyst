import { NextRequest, NextResponse } from "next/server";
import { processApplication } from "@/services/scoring/process-application.service";
import { routeError } from "@/lib/http/route-error";
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await processApplication(id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return routeError(error);
  }
}
