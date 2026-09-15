# Deployment and Release Checklist

## Build and database

- [x] `npm ci`
- [x] `npm run verify:links`
- [x] `npm test`
- [x] `npm run db:test:local`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Local Supabase startup/reset through migration 17
- [x] Migrations 18–19 applied to real PostgreSQL and all SQL tests passed
- [ ] Linked-remote `db push --dry-run` and backup review
- [ ] Linked-remote migration deployment
- [ ] Credential-backed role E2E and provider tests
- [ ] Representative load report against the target environment

## Release procedure

1. Back up the target Postgres database and record the current migration ledger.
2. Run `npx supabase db push --dry-run`; verify migrations 18 and 19 are the intended pending changes.
3. Run `npx supabase db push` in the approved deployment window.
4. Generate linked types with `npm run db:types` and confirm no diff from committed types.
5. Install and run all local quality gates.
6. Build and deploy the standalone Next.js output with documented environment variables.
7. Configure notification and operations cron schedules.
8. Run release check, production smoke, seeded role journeys, private-file negative tests, provider tests, and performance load.
9. Monitor errors, queue age/dead letters, security events, response latency and database health.

Application rollback uses the previous build. Database rollback uses a reviewed forward repair or tested backup restore; applied migration history is never deleted. Release is not approved while any critical acceptance row remains BLOCKED.
