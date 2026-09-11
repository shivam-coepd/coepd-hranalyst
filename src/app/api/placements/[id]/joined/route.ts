import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  markPlacementJoined,
} from "@/services/placements/placement.service";

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

    await markPlacementJoined({
      placementId:
        id,

      joinedAt:
        body.joinedAt,
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to update placement",
      },
      {
        status: 400,
      }
    );
  }
}