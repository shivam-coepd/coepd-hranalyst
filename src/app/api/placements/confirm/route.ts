import { NextRequest, NextResponse } from "next/server";
import { confirmPlacement } from "@/services/placements/placement.service";
import { routeError } from "@/lib/http/route-error";
import { requireRole } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  try {
    await requireRole(["placement_hr", "admin", "super_admin"]);
    const body = await request.json();
    const result = await confirmPlacement({
      offerId: body.offerId,
      notes: body.notes,
    });
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
