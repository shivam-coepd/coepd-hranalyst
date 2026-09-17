import "server-only";

export async function sendTelegramMessage({
  chatId,
  text,
}: {
  chatId: string;
  text: string;
}) {
  if (process.env.TELEGRAM_ENABLED !== "true") {
    return {
      provider: "telegram-disabled",

      providerMessageId: null,
    };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        chat_id: chatId,

        text,

        disable_web_page_preview: false,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.description ?? "Telegram delivery failed");
  }

  return {
    provider: "telegram",

    providerMessageId: String(result.result?.message_id ?? ""),
  };
}
