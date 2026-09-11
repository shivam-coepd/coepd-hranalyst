import "server-only";

import {
  mailTransport,
  getMailFrom,
} from "@/lib/email/smtp";

export async function
sendEmail({
  to,
  subject,
  html,
  ics,
}: {
  to:
    string;
  subject:
    string;
  html:
    string;
  ics?:
    string | null;
}) {

  if (
    process.env.EMAIL_ENABLED ===
    "false"
  ) {
    return {
      provider:
        "smtp-disabled",

      providerMessageId:
        null,
    };
  }

  const result =
    await mailTransport
      .sendMail({
        from:
          getMailFrom(),

        to,

        subject,

        html,

        attachments:
          ics
            ? [
                {
                  filename:
                    "interview.ics",

                  content:
                    ics,

                  contentType:
                    "text/calendar; charset=utf-8; method=REQUEST",
                },
              ]
            : [],
      });

  return {
    provider:
      "smtp",

    providerMessageId:
      result.messageId,
  };
}