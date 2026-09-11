import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  authorizePerformanceRequest,
} from "@/lib/performance/authorize";

import {
  getPerformanceStudentFeed,
} from "@/services/performance/feed.service";

import {
  apiError,
} from "@/lib/http/api-error";

import {
  getOrCreateRequestId,
} from "@/lib/http/request-id";

export async function GET(
  request:
    NextRequest
) {

  const requestId =
    getOrCreateRequestId(
      request
    );

  const startedAt =
    performance.now();

  try {

    authorizePerformanceRequest(
      request
    );

    const cursor =
      request.nextUrl
        .searchParams
        .get("cursor");

    const limit =
      Number(
        request.nextUrl
          .searchParams
          .get("limit")
        ??
        25
      );

    const feed =
      await getPerformanceStudentFeed({
        cursor,
        limit,
      });

    const elapsed =
      performance.now()
      -
      startedAt;

    return NextResponse.json(
      {
        success:
          true,

        elapsedMs:
          Number(
            elapsed
              .toFixed(2)
          ),

        ...feed,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",

          "x-request-id":
            requestId,

          "server-timing":
            `feed;dur=${elapsed.toFixed(2)}`,
        },
      }
    );

  } catch (error) {

    return apiError(
      error,
      {
        requestId,
        fallback:
          "Performance feed failed",
      }
    );
  }
}