import { routeError } from "@/lib/http/route-error";
import { NextRequest, NextResponse } from "next/server";

import { decideOffer } from "@/services/offers/offer.service";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const result = await decideOffer({
      offerId: id,

      decision: body.decision,

      reason: body.reason,
    });

    return NextResponse.json({
      ...result,
    });
  } catch (error) {
    return routeError(error);
  }
}
