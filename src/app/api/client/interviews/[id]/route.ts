import {
  NextResponse,
} from "next/server";

import {
  getInterviewById,
} from "@/repositories/interviews.repository";

import {
  requireActiveClientHr,
} from "@/services/client/client-profile.service";

export async function GET(
  _request:
    Request,
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

    const {
      clientProfile,
    } =
      await requireActiveClientHr();

    const interview =
      await getInterviewById(
        id
      );

    if (
      interview.company_id !==
      clientProfile.company_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Not authorized",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json({
      success: true,
      interview,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load interview",
      },
      {
        status: 404,
      }
    );
  }
}