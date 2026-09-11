import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function
sendInAppNotification({
  userId,
  eventType,
  title,
  message,
  entityType,
  entityId,
  actionUrl,
  severity,
}: {
  userId:
    string;
  eventType:
    string;
  title:
    string;
  message:
    string;
  entityType?:
    string | null;
  entityId?:
    string | null;
  actionUrl?:
    string | null;
  severity?:
    "info"
    | "success"
    | "warning"
    | "error";
}) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("notifications")
      .insert({
        user_id:
          userId,

        event_type:
          eventType,

        title,

        message,

        entity_type:
          entityType ??
          null,

        entity_id:
          entityId ??
          null,

        action_url:
          actionUrl ??
          null,

        severity:
          severity ??
          "info",
      })
      .select("id")
      .single();

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    provider:
      "supabase",

    providerMessageId:
      data.id,
  };
}