import { routeError } from "@/lib/http/route-error";
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/guards";

import { createUatRun } from "@/services/uat/uat.service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();

    const releaseVersion = String(body.releaseVersion ?? "").trim();

    if (!releaseVersion) {
      throw new Error("Release version is required");
    }

    const run = await createUatRun({
      releaseVersion,

      executedBy: user.id,
    });

    return NextResponse.json(
      {
        success: true,

        run,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return routeError(error);
  }
}
