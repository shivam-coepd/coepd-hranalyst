import { NextResponse } from "next/server";

import { authorizePerformanceRequest } from "@/lib/performance/authorize";

import { processNotificationOutbox } from "@/services/notifications/notification-worker.service";

export async function POST(request: Request) {
  authorizePerformanceRequest(request);

  const started = performance.now();

  const result = await processNotificationOutbox();

  const elapsedMs = performance.now() - started;

  return NextResponse.json({
    success: true,

    elapsedMs: Number(elapsedMs.toFixed(2)),

    ...result,
  });
}
