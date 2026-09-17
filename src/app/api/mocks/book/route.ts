import { NextRequest, NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { bookMockSchema } from "@/lib/validators/mock.schema";
import { bookMockSlot } from "@/services/mocks/mock.service";
export async function POST(req: NextRequest) {
  try {
    const v = bookMockSchema.parse(await req.json());
    const id = await bookMockSlot(v.applicationId, v.slotId);
    return NextResponse.json({ success: true, mockId: id }, { status: 201 });
  } catch (e) {
    return routeError(e);
  }
}
