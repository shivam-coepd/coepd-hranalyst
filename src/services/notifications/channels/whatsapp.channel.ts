import "server-only";

export async function sendWhatsAppMessage({
  phone,
  message,
}: {
  phone: string;
  message: string;
}) {
  if (process.env.WHATSAPP_ENABLED !== "true") {
    return {
      provider: "whatsapp-disabled",

      providerMessageId: null,
    };
  }

  const url = process.env.WHATSAPP_WEBHOOK_URL;

  const token = process.env.WHATSAPP_WEBHOOK_TOKEN;

  if (!url) {
    throw new Error("WHATSAPP_WEBHOOK_URL is not configured");
  }

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },

    body: JSON.stringify({
      phone,
      message,
    }),
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(`WhatsApp delivery failed: ${text}`);
  }

  const result = await response.json().catch(() => ({}));

  return {
    provider: "whatsapp-webhook",

    providerMessageId: result.id ? String(result.id) : null,
  };
}
