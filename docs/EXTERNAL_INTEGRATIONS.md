# External Integrations

Supabase supplies Postgres, authentication, private object storage, and notification realtime subscriptions. It is required for a running deployment.

OpenAI supports structured CV extraction and generated job checklists when configured. These workflows report configuration or provider failures rather than fabricating results.

SMTP delivers email notifications. WhatsApp and Telegram channels require their respective provider credentials. Delivery attempts are recorded independently; disabled or unavailable channels fail visibly and enter the configured retry path.

Cron endpoints require a shared authorization secret. Production smoke, UAT bootstrap, and performance scripts require the dedicated variables listed in `.env.example`.

Before production release, validate each enabled provider in the target environment, confirm least-privilege credentials, verify callback and storage settings, and test retry behavior without exposing secrets.
