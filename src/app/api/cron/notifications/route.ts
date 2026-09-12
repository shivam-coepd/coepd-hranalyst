import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron/authorize";

import { processNotificationOutbox } from "@/services/notifications/notification-worker.service";

export async function POST(request: Request) {
  try {
    authorizeCron(request);

    const result = await processNotificationOutbox();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return routeError(error);
  }
}
