import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function logNotificationDelivery({
  outboxId,
  eventType,
  channel,
  recipientUserId,
  recipientAddress,
  provider,
  providerMessageId,
  status,
  errorMessage,
}: {
  outboxId: string;
  eventType: string;
  channel: string;
  recipientUserId?: string | null;
  recipientAddress?: string | null;
  provider?: string | null;
  providerMessageId?: string | null;
  status: "sent" | "failed" | "skipped";
  errorMessage?: string | null;
}) {
  await supabaseAdmin.from("notification_delivery_logs").insert({
    outbox_id: outboxId,

    event_type: eventType,

    channel,

    recipient_user_id: recipientUserId ?? null,

    recipient_address: recipientAddress ?? null,

    provider: provider ?? null,

    provider_message_id: providerMessageId ?? null,

    status,

    error_message: errorMessage ?? null,
  });
}
