import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function
getNotifications(
  userId:
    string,
  limit =
    50
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "notifications"
      )
      .select(`
        id,
        event_type,
        title,
        message,
        entity_type,
        entity_id,
        action_url,
        severity,
        is_read,
        read_at,
        created_at
      `)
      .eq(
        "user_id",
        userId
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      )
      .limit(
        Math.min(
          limit,
          100
        )
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data ?? [];
}

export async function
getUnreadNotificationCount(
  userId:
    string
) {

  const {
    count,
    error,
  } =
    await supabaseAdmin
      .from(
        "notifications"
      )
      .select(
        "id",
        {
          count:
            "exact",
          head:
            true,
        }
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "is_read",
        false
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return count ?? 0;
}