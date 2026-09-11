import "server-only";

import { z } from "zod";

const booleanString = z.enum(["true", "false"]);

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),

    NEXT_PUBLIC_APP_NAME: z.string().min(2),

    NEXT_PUBLIC_APP_VERSION: z.string().min(1),

    NEXT_PUBLIC_APP_URL: z.string().url(),

    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),

    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),

    SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

    OPENAI_API_KEY: z.string().min(20),

    OPENAI_CHECKLIST_MODEL: z.string().min(2),

    SMTP_HOST: z.string().min(1),

    SMTP_PORT: z.coerce.number().int().positive(),

    SMTP_SECURE: booleanString,

    SMTP_USER: z.string().min(1),

    SMTP_PASSWORD: z.string().min(1),

    SMTP_FROM_EMAIL: z.string().email(),

    SMTP_FROM_NAME: z.string().min(2),

    EMAIL_ENABLED: booleanString,

    CRON_SECRET: z.string().min(32),

    NOTIFICATION_BATCH_SIZE: z.coerce.number().int().min(1).max(200),

    WHATSAPP_ENABLED: booleanString.default("false"),

    WHATSAPP_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),

    WHATSAPP_WEBHOOK_TOKEN: z.string().optional(),

    TELEGRAM_ENABLED: booleanString.default("false"),

    TELEGRAM_BOT_TOKEN: z.string().optional(),

    PERF_TEST_ENABLED: booleanString.default("false"),

    ALLOW_PRODUCTION_PERF_TEST: booleanString.default("false"),

    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  })
  .superRefine((value, ctx) => {
    if (value.WHATSAPP_ENABLED === "true" && !value.WHATSAPP_WEBHOOK_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["WHATSAPP_WEBHOOK_URL"],

        message: "WHATSAPP_WEBHOOK_URL is required when WhatsApp is enabled",
      });
    }

    if (value.TELEGRAM_ENABLED === "true" && !value.TELEGRAM_BOT_TOKEN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["TELEGRAM_BOT_TOKEN"],

        message: "TELEGRAM_BOT_TOKEN is required when Telegram is enabled",
      });
    }

    if (value.NODE_ENV === "production" && value.PERF_TEST_ENABLED === "true") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["PERF_TEST_ENABLED"],

        message:
          "Performance test endpoints must remain disabled in normal production",
      });
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(JSON.stringify(parsed.error.flatten(), null, 2));

  throw new Error("Invalid server environment configuration");
}

export const serverEnv = parsed.data;
