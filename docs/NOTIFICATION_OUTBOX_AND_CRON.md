# Notification Outbox and Cron

The platform has one `notification_outbox` with `pending`, `processing`, `sent`, transient `failed` semantics where used, `dead_letter`, and `cancelled`. A unique dedupe key prevents duplicate logical events.

The worker claims due rows atomically with `FOR UPDATE SKIP LOCKED`, increments attempts, records claim ownership through the attempt number, and only accepts completion from the current claim. A temporary failure schedules retry with backoff; exhaustion moves the row to `dead_letter`. Stale processing rows become claimable again. Delivery logs record channel outcomes.

Producers queue onboarding, job creation/publication, application, verification, Client submission, shortlist, interview/calendar, feedback, offer, and placement events. In-app notifications have read/read-all endpoints and Realtime subscription support. Email uses SMTP when enabled; Telegram and WhatsApp run only when explicitly enabled and configured.

`/api/cron/notifications` and `/api/cron/operations` require `CRON_SECRET`; invalid credentials return 401 and worker exceptions return actionable masked 500 responses. Operations detect feedback overdue after 24 hours, Client escalation after 48 hours, and Student CV/action reminders. Operational-alert dedupe keys make repeated cron runs idempotent.

`stage12_notification_delivery.sql` proves non-overlapping claims, attempt increment, stale acknowledgement rejection, retry, terminal dead-letter and dedupe behavior. Full provider delivery remains configuration-dependent.
