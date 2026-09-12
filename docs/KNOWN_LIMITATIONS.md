# Known Limitations

- Docker is unavailable on the current host, so `supabase db reset`, the complete Auth/Storage/Realtime stack, and `pg_stat_statements` checks could not run here. The portable migration and SQL contract harness passed.
- Credential-backed Playwright journeys require seeded Super Admin, Placement Admin, Placement HR, Client HR, and Student accounts. Those tests skip when the corresponding `E2E_*` variables are absent.
- OpenAI, SMTP, WhatsApp, Telegram, and production smoke behavior require target-environment credentials and provider access.
- Supplied load scripts require a seeded external environment; no production-capacity claim is made from this recovery host.
- The production dependency audit reports zero vulnerabilities. The full development audit reports three moderate advisories through `autocannon -> hyperid -> uuid`; npm's automatic proposal is an incompatible downgrade, so it was not applied.
