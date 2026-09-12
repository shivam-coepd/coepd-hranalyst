import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron/authorize";

import { runOperationalChecks } from "@/services/operations/operations.service";

import { processNotificationOutbox } from "@/services/notifications/notification-worker.service";

export async function POST(request: Request) {
  try {
    authorizeCron(request);

    const operations = await runOperationalChecks();

    const delivery = await processNotificationOutbox();

    return NextResponse.json({
      success: true,
      operations,
      delivery,
    });
  } catch (error) {
    return routeError(error);
  }
}
