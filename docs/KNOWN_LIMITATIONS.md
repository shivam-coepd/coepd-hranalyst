# Known Limitations

- Docker Supabase and `pg_stat_statements` SQL validation passed. Windows Application Control later blocked the downloaded Supabase CLI executable, so a second CLI reset containing migrations 18–19 could not run; those migrations passed from zero in PGlite and directly on the Supabase PostgreSQL container.
- Credential-backed Playwright journeys require seeded Super Admin, Placement Admin, Placement HR, Client HR, and Student accounts. Those tests skip when the corresponding `E2E_*` variables are absent.
- OpenAI, SMTP, WhatsApp, Telegram, and production smoke behavior require target-environment credentials and provider access.
- The linked remote database still needs reviewed migrations 18–19. Supplied load scripts require a seeded external environment; no production-capacity claim is made from this recovery host.
- The production dependency audit reports zero vulnerabilities. The full development audit reports three moderate advisories through `autocannon -> hyperid -> uuid`; npm's automatic proposal is an incompatible downgrade, so it was not applied.
