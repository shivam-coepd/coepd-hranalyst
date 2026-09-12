import { NextRequest, NextResponse } from "next/server";
import { withdrawOffer } from "@/services/offers/offer.service";
import { routeError } from "@/lib/http/route-error";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await withdrawOffer({ offerId: id, reason: body.reason });
    return NextResponse.json({ success: true });
  } catch (error) {
    return routeError(error);
  }
}
