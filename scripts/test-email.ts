import { mailTransport, getMailFrom } from "../src/lib/email/smtp";

const recipient = process.env.SMTP_TEST_RECIPIENT;

if (!recipient) {
  throw new Error("SMTP_TEST_RECIPIENT is required");
}

async function main() {
  const result = await mailTransport.sendMail({
    from: getMailFrom(),

    to: recipient,

    subject: "HRAnalyst Production SMTP Test",

    text: "HRAnalyst Placement Wing production SMTP configuration is working.",

    html: `
          <p>
            HRAnalyst Placement Wing production SMTP configuration is working.
          </p>
          `,
  });

  console.log(
    JSON.stringify(
      {
        messageId: result.messageId,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
