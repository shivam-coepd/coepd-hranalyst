import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  scheduleInterview,
} from "@/services/interviews/interview.service";

import {
  requireActiveClientHr,
} from "@/services/client/client-profile.service";

import {
  getClientInterviews,
} from "@/repositories/interviews.repository";

export async function GET() {

  try {

    const {
      clientProfile,
    } =
      await requireActiveClientHr();

    const interviews =
      await getClientInterviews(
        clientProfile.company_id
      );

    return NextResponse.json(
      {
        success: true,
        interviews,
      }
    );

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load interviews",
      },
      {
        status: 403,
      }
    );
  }
}

export async function POST(
  request:
    NextRequest
) {

  try {

    const body =
      await request.json();

    const result =
      await scheduleInterview(
        body
      );

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to schedule interview",
      },
      {
        status: 400,
      }
    );
  }
}