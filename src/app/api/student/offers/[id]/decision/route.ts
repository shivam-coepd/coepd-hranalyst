import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  decideOffer,
} from "@/services/offers/offer.service";

export async function POST(
  request:
    NextRequest,
  context: {
    params:
      Promise<{
        id: string;
      }>;
  }
) {

  try {

    const {
      id,
    } =
      await context.params;

    const body =
      await request.json();

    const result =
      await decideOffer({
        offerId:
          id,

        decision:
          body.decision,

        reason:
          body.reason,
      });

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to save offer decision",
      },
      {
        status: 400,
      }
    );
  }
}