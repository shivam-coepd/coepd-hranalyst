import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/guards";

import {
  getNotifications,
  getUnreadNotificationCount,
} from "@/repositories/notifications.repository";

export async function GET() {
  try {
    const user = await requireUser();

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(user.id),

      getUnreadNotificationCount(user.id),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    return routeError(error);
  }
}
