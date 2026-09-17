import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/guards";

import {
  buildPlacementsCsv,
  buildApplicationsCsv,
  buildFeedbackSlaCsv,
} from "@/services/reports/report.service";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      type: string;
    }>;
  },
) {
  try {
    await requireRole(["placement_hr", "admin", "super_admin"]);

    const { type } = await context.params;

    let csv: string;

    let fileName: string;

    switch (type) {
      case "placements":
        csv = await buildPlacementsCsv();

        fileName = "placements-report.csv";

        break;

      case "applications":
        csv = await buildApplicationsCsv();

        fileName = "applications-report.csv";

        break;

      case "feedback-sla":
        csv = await buildFeedbackSlaCsv();

        fileName = "feedback-sla-report.csv";

        break;

      default:
        return NextResponse.json(
          {
            success: false,

            error: "Unknown report type",
          },
          {
            status: 404,
          },
        );
    }

    return new NextResponse(csv, {
      status: 200,

      headers: {
        "Content-Type": "text/csv; charset=utf-8",

        "Content-Disposition": `attachment; filename="${fileName}"`,

        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return routeError(error);
  }
}
