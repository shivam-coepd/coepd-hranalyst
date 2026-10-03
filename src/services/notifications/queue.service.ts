import { toJson } from "@/lib/json";
import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function queueNotification({
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
  eventType: string;
  channel: "in_app" | "email" | "calendar" | "whatsapp" | "telegram";
  recipientUserId?: string | null;
  recipientEmail?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown>;
  dedupeKey?: string | null;
  scheduledFor?: string | null;
}) {
  const { error } = await supabaseAdmin.from("notification_outbox").insert({
    event_type: eventType,

    channel,

    recipient_user_id: recipientUserId ?? null,

    recipient_email: recipientEmail ?? null,

    entity_type: entityType ?? null,

    entity_id: entityId ?? null,

    payload: toJson(payload ?? {}),

    dedupe_key: dedupeKey ?? null,

    scheduled_for: scheduledFor ?? new Date().toISOString(),
  });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  // Trigger worker asynchronously so the user receives the live notification immediately
  // without having to wait for the next cron job cycle.
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.CRON_SECRET) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/notifications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    }).catch((e) => {
      console.error("Failed to trigger immediate notification processing", e);
    });
  }
}
