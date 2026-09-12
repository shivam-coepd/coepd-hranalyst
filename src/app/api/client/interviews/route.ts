import { routeError } from "@/lib/http/route-error";
import { NextRequest, NextResponse } from "next/server";

import { scheduleInterview } from "@/services/interviews/interview.service";

import { requireActiveClientHr } from "@/services/client/client-profile.service";

import { getClientInterviews } from "@/repositories/interviews.repository";

export async function GET() {
  try {
    const { clientProfile } = await requireActiveClientHr();

    const interviews = await getClientInterviews(clientProfile.company_id);

    return NextResponse.json({
      success: true,
      interviews,
    });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await scheduleInterview(body);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return routeError(error);
  }
}
