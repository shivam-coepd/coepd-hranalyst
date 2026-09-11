import {
  NextResponse,
} from "next/server";

import {
  authorizeCron,
} from "@/lib/cron/authorize";

import {
  processNotificationOutbox,
} from "@/services/notifications/notification-worker.service";

export async function POST(
  request:
    Request
) {

  try {

    authorizeCron(
      request
    );

    const result =
      await processNotificationOutbox();

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Notification worker failed",
      },
      {
        status: 401,
      }
    );
  }
}