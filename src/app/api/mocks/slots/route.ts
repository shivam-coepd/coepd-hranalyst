import { NextRequest, NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { createMockAvailabilitySlot } from "@/services/mocks/mock.service";
export async function POST(req: NextRequest) {
  try {
    const id = await createMockAvailabilitySlot(await req.json());
    return NextResponse.json({ success: true, slotId: id }, { status: 201 });
  } catch (e) {
    return routeError(e);
  }
}
