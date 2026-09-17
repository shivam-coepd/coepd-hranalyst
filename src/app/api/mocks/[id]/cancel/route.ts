import { NextRequest, NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { cancelMockSchema } from "@/lib/validators/mock.schema";
import { cancelMockInterview } from "@/services/mocks/mock.service";
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const v = cancelMockSchema.parse(await req.json());
    await cancelMockInterview(id, v.reason);
    return NextResponse.json({ success: true });
  } catch (e) {
    return routeError(e);
  }
}
