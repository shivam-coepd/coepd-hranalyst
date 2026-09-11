import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  renderNotification,
} from "./notification-renderer.service";

import {
  resolveRecipient,
} from "./recipient.service";

import {
  sendInAppNotification,
} from "./channels/in-app.channel";

import {
  sendEmail,
} from "./channels/email.channel";

import {
  sendTelegramMessage,
} from "./channels/telegram.channel";

import {
  sendWhatsAppMessage,
} from "./channels/whatsapp.channel";

import {
  logNotificationDelivery,
} from "./delivery-log.service";

import {
  getCalendarInviteForOutbox,
} from "./calendar-resolver.service";

type OutboxRow = {
  id:
    string;
  event_type:
    string;
  channel:
    string;
  recipient_user_id:
    string | null;
  recipient_email:
    string | null;
  entity_type:
    string | null;
  entity_id:
    string | null;
  payload:
    Record<
      string,
      unknown
    >;
};

export async function
processNotificationOutbox() {

  await supabaseAdmin.rpc(
    "recover_stuck_notifications"
  );

  const batchSize =
    Math.min(
      Math.max(
        Number(
          process.env
            .NOTIFICATION_BATCH_SIZE ??
          50
        ),
        1
      ),
      200
    );

  const {
    data,
    error,
  } =
    await supabaseAdmin.rpc(
      "claim_notification_outbox",
      {
        p_limit:
          batchSize,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  const rows =
    (data ?? []) as
      OutboxRow[];

  let sent = 0;
  let failed = 0;

  for (
    const row
    of rows
  ) {

    try {

      const rendered =
        renderNotification(
          row.event_type,
          row.payload ?? {}
        );

      let recipient =
        null;

      if (
        row.recipient_user_id
      ) {
        recipient =
          await resolveRecipient(
            row.recipient_user_id
          );
      }

      let provider:
        string | null =
        null;

      let providerMessageId:
        string | null =
        null;

      let recipientAddress:
        string | null =
        null;

      switch (
        row.channel
      ) {

        case "in_app": {

          if (
            !row.recipient_user_id
          ) {
            throw new Error(
              "In-app notification requires recipient_user_id"
            );
          }

          const result =
            await sendInAppNotification({
              userId:
                row.recipient_user_id,

              eventType:
                row.event_type,

              title:
                rendered.title,

              message:
                rendered.message,

              entityType:
                row.entity_type,

              entityId:
                row.entity_id,

              actionUrl:
                rendered.actionUrl,
            });

          provider =
            result.provider;

          providerMessageId =
            result.providerMessageId;

          recipientAddress =
            row.recipient_user_id;

          break;
        }


        case "email": {

          const email =
            row.recipient_email ??
            recipient?.email;

          if (!email) {
            throw new Error(
              "Recipient email not available"
            );
          }

          const ics =
            await getCalendarInviteForOutbox({
              eventType:
                row.event_type,

              entityId:
                row.entity_id,
            });

          const result =
            await sendEmail({
              to:
                email,

              subject:
                rendered.subject,

              html:
                rendered.html,

              ics,
            });

          provider =
            result.provider;

          providerMessageId =
            result.providerMessageId;

          recipientAddress =
            email;

          break;
        }


        case "calendar": {

          const email =
            row.recipient_email ??
            recipient?.email;

          if (!email) {
            throw new Error(
              "Calendar delivery requires an email recipient"
            );
          }

          const ics =
            await getCalendarInviteForOutbox({
              eventType:
                row.event_type,

              entityId:
                row.entity_id,
            });

          if (!ics) {
            throw new Error(
              "Calendar data unavailable"
            );
          }

          const result =
            await sendEmail({
              to:
                email,

              subject:
                rendered.subject,

              html:
                rendered.html,

              ics,
            });

          provider =
            result.provider;

          providerMessageId =
            result.providerMessageId;

          recipientAddress =
            email;

          break;
        }


        case "telegram": {

          const chatId =
            String(
              row.payload
                ?.telegram_chat_id ??
              ""
            );

          if (!chatId) {
            throw new Error(
              "telegram_chat_id missing"
            );
          }

          const result =
            await sendTelegramMessage({
              chatId,

              text:
                `${rendered.title}\n\n${rendered.message}${rendered.actionUrl ? `\n\n${rendered.actionUrl}` : ""}`,
            });

          provider =
            result.provider;

          providerMessageId =
            result.providerMessageId;

          recipientAddress =
            chatId;

          break;
        }


        case "whatsapp": {

          const phone =
            String(
              row.payload
                ?.phone ??
              recipient?.phone ??
              ""
            );

          if (!phone) {
            throw new Error(
              "Recipient phone unavailable"
            );
          }

          const result =
            await sendWhatsAppMessage({
              phone,

              message:
                `${rendered.title}\n\n${rendered.message}${rendered.actionUrl ? `\n\n${rendered.actionUrl}` : ""}`,
            });

          provider =
            result.provider;

          providerMessageId =
            result.providerMessageId;

          recipientAddress =
            phone;

          break;
        }


        default:
          throw new Error(
            `Unsupported notification channel: ${row.channel}`
          );
      }

      await logNotificationDelivery({
        outboxId:
          row.id,

        eventType:
          row.event_type,

        channel:
          row.channel,

        recipientUserId:
          row.recipient_user_id,

        recipientAddress,

        provider,

        providerMessageId,

        status:
          "sent",
      });

      await supabaseAdmin.rpc(
        "mark_notification_sent",
        {
          p_outbox_id:
            row.id,
        }
      );

      sent++;

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Notification delivery failed";

      failed++;

      await logNotificationDelivery({
        outboxId:
          row.id,

        eventType:
          row.event_type,

        channel:
          row.channel,

        recipientUserId:
          row.recipient_user_id,

        status:
          "failed",

        errorMessage:
          message,
      });

      await supabaseAdmin.rpc(
        "mark_notification_failed",
        {
          p_outbox_id:
            row.id,

          p_error:
            message,
        }
      );
    }
  }

  return {
    claimed:
      rows.length,

    sent,

    failed,
  };
}