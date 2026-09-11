import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function
queueNotification({
  eventType,
  channel,
  recipientUserId,
  recipientEmail,
  entityType,
  entityId,
  payload,
  dedupeKey,
  scheduledFor,
}: {
  eventType:
    string;
  channel:
    "in_app"
    | "email"
    | "calendar"
    | "whatsapp"
    | "telegram";
  recipientUserId?:
    string | null;
  recipientEmail?:
    string | null;
  entityType?:
    string | null;
  entityId?:
    string | null;
  payload?:
    Record<
      string,
      unknown
    >;
  dedupeKey?:
    string | null;
  scheduledFor?:
    string | null;
}) {

  const {
    error,
  } =
    await supabaseAdmin
      .from(
        "notification_outbox"
      )
      .insert({
        event_type:
          eventType,

        channel,

        recipient_user_id:
          recipientUserId ??
          null,

        recipient_email:
          recipientEmail ??
          null,

        entity_type:
          entityType ??
          null,

        entity_id:
          entityId ??
          null,

        payload:
          payload ?? {},

        dedupe_key:
          dedupeKey ??
          null,

        scheduled_for:
          scheduledFor ??
          new Date()
            .toISOString(),
      });

  if (
    error &&
    error.code !==
      "23505"
  ) {
    throw new Error(
      error.message
    );
  }
}