import {
  NextResponse,
} from "next/server";

import {
  authorizePerformanceRequest,
} from "@/lib/performance/authorize";

import {
  getPerformanceVerificationQueue,
} from "@/services/performance/verification-queue.service";

export async function GET(
  request:
    Request
) {

  authorizePerformanceRequest(
    request
  );

  const started =
    performance.now();

  const items =
    await getPerformanceVerificationQueue();

  const elapsedMs =
    performance.now()
    -
    started;

  return NextResponse.json({
    success:
      true,

    elapsedMs:
      Number(
        elapsedMs
          .toFixed(2)
      ),

    count:
      items.length,

    items,
  });
}