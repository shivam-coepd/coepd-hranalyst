# Environment

Copy `.env.example` to `.env.local` and supply values for the services used in the target environment. `.env.local` is ignored by Git and must remain private.

Required application values are the Supabase URL, publishable or anonymous key, and service-role key. Server-only code validates privileged credentials before use. Public browser variables use the `NEXT_PUBLIC_` prefix.

Optional groups configure OpenAI CV/checklist processing, SMTP email, WhatsApp, Telegram, cron authorization, performance routes, production smoke checks, bootstrap users, UAT users, and Playwright role journeys. The comments in `.env.example` describe each variable and the feature that consumes it.

Use separate Supabase projects and credentials for development, staging, and production. Rotate any credential that may have been exposed and never place secrets in committed documentation, fixtures, browser bundles, or command output.
