import { routeError } from "@/lib/http/route-error";
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/guards";

import { updateUatResult } from "@/services/uat/uat.service";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      runId: string;

      testCode: string;
    }>;
  },
) {
  try {
    await requireAdmin();

    const { runId, testCode } = await context.params;

    const body = await request.json();

    if (!["passed", "failed", "blocked", "not_run"].includes(body.status)) {
      throw new Error("Invalid UAT status");
    }

    await updateUatResult({
      runId,

      testCode,

      status: body.status,

      actualResult: body.actualResult,

      evidence: body.evidence,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return routeError(error);
  }
}
