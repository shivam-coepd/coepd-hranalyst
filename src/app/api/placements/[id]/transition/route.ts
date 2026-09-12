import { NextRequest, NextResponse } from "next/server";
import { transitionPlacement } from "@/services/placements/placement.service";
import { routeError } from "@/lib/http/route-error";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await transitionPlacement({
      placementId: id,
      newStatus: body.newStatus,
      reason: body.reason,
      effectiveAt: body.effectiveAt,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return routeError(error);
  }
}
