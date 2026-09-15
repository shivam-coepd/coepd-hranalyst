# Environment Configuration

`.env.example` is the canonical template. Empty examples below intentionally contain no secret values.

| Variable | Purpose | Requirement / visibility | Consumed by | Failure behavior |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | Required; browser/server | Supabase clients | Startup/client creation error |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Preferred public API key | Required unless anon key supplied; browser/server | Supabase clients | Client creation error |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy public key fallback | Optional; browser/server | Supabase clients | Publishable key must exist |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server operations | Required; server secret | Admin client, scripts | Privileged workflows fail closed |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL | Required in deployment; public | callbacks, links, mail/calendar | URL-dependent output cannot be built |
| `NEXT_PUBLIC_APP_VERSION` | Release display/version | Optional; public | layout/health metadata | Uses application default |
| `OPENAI_API_KEY` | Structured AI requests | Required for AI workflows; server secret | OpenAI client | AI workflow returns configuration error |
| `OPENAI_CHECKLIST_MODEL` | Checklist model | Required with checklist AI; server | checklist generator | Checklist generation fails explicitly |
| `OPENAI_CV_MODEL` | CV extraction model | Required with CV AI; server | CV extraction | Extraction fails explicitly/retryable |
| `HRANALYST_STUDENT_VERIFY_URL` | Existing-Student registry endpoint | Required for Student provisioning; server | verification service | Student provisioning is blocked |
| `HRANALYST_STUDENT_VERIFY_TOKEN` | Registry credential | Required for Student provisioning; server secret | verification service | Student provisioning is blocked |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP transport | Required when email enabled; server | email channel/scripts | Email attempt fails and retries |
| `SMTP_USER`, `SMTP_PASSWORD` | SMTP credentials | Provider-dependent; server secret | email channel | Authenticated SMTP fails |
| `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` | Sender identity | Required when email enabled; server | email channel | Email configuration error |
| `EMAIL_ENABLED` | Enable email delivery | Optional boolean; server | email channel | Disabled channel is explicit |
| `TELEGRAM_ENABLED`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_JOB_CHANNEL_ID` | Optional Telegram delivery | Optional; token is server secret | Telegram channel | Disabled/unconfigured channel is explicit |
| `WHATSAPP_ENABLED`, `WHATSAPP_WEBHOOK_URL`, `WHATSAPP_WEBHOOK_TOKEN` | Optional WhatsApp delivery | Optional; token is server secret | WhatsApp channel | Disabled/unconfigured channel is explicit |
| `CRON_SECRET` | Cron endpoint bearer secret | Required for cron; server secret | cron authorization | Missing/invalid request returns 401 |
| `NOTIFICATION_BATCH_SIZE` | Worker claim size | Optional integer | notification worker | Safe default is used |
| `MAINTENANCE_MODE` | Planned maintenance switch | Optional boolean | proxy/pages | Normal operation when false |
| `BOOTSTRAP_SUPER_ADMIN_EMAIL`, `BOOTSTRAP_SUPER_ADMIN_PASSWORD` | First-admin script | Script-only; password secret | bootstrap script | Script refuses incomplete input |
| `UAT_USER_PASSWORD` | Seeded UAT account password | Script-only secret | UAT user script | Script refuses incomplete input |
| `PRODUCTION_BASE_URL` | Smoke-test target | Required for production smoke | smoke script | Script refuses missing target |
| `SMTP_TEST_RECIPIENT` | Email-test destination | Script-only | email test | Test refuses missing recipient |
| `E2E_BASE_URL` | Existing E2E deployment | Optional | Playwright runner | Runner starts local standalone server |
| `E2E_ADMIN_EMAIL/PASSWORD` | Admin journey account | Required for that journey; secrets | Playwright | Journey skips |
| `E2E_PLACEMENT_HR_EMAIL/PASSWORD` | Placement HR journey account | Required for that journey; secrets | Playwright | Journey skips |
| `E2E_CLIENT_HR_EMAIL/PASSWORD` | Client HR journey account | Required for that journey; secrets | Playwright | Journey skips |
| `E2E_STUDENT_EMAIL/PASSWORD` | Student journey account | Required for that journey; secrets | Playwright | Journey skips |
| `PERF_TEST_ENABLED`, `ALLOW_PRODUCTION_PERF_TEST` | Explicit load-test gates | Optional booleans; server | perf routes/scripts | Routes fail closed |
| `PERF_TEST_SECRET` | Load-route credential | Required for load routes; server secret | perf authorization | Request denied |
| `PERF_TEST_BASE_URL`, `PERF_TEST_USER_PASSWORD` | Load target/account | Required for load run; password secret | performance scripts | Script refuses/requests configuration |
| `PERF_STUDENT_COUNT`, `PERF_JOB_COUNT`, `PERF_APPLICATION_COUNT`, `PERF_NOTIFICATION_COUNT` | Fixture sizes | Optional integers | seed scripts | Documented defaults used |
| `PERF_CONCURRENCY`, `PERF_DURATION_SECONDS` | Load profile | Optional integers | load scripts | Documented defaults used |
| `PERF_FEED_P95_MS`, `PERF_FEED_P99_MS`, `PERF_ERROR_RATE_PERCENT` | Acceptance thresholds | Optional numeric values | performance report | Documented thresholds used |
| `LOG_LEVEL` | Server log threshold | Optional | logger | Defaults to info |
| `NODE_ENV`, `CI` | Runtime/tooling mode | Platform supplied | Next.js/tests | Framework defaults apply |

Safe examples are present in `.env.example`, such as `https://placements.example.com`, boolean flags, counts and blank secret fields. Never commit `.env.local`.
