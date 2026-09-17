# Testing

Run the local verification gates from the repository root:

```powershell
npm ci
npm run verify:links
npm test
npm run db:test:local
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm audit --omit=dev
```

Unit tests cover scoring weights, empty scoring categories, verified-score overrides, the 60 percent submission gate, workflow status helpers, offer validation, account routing, and CSV formula-injection defense.

The migration harness applies all migrations from zero and runs SQL contract tests, including direct cross-tenant RLS probes. `slow_queries.sql` requires `pg_stat_statements`, which the in-process PGlite harness does not provide; run it against a full Supabase/Postgres instance.

Playwright always tests public authentication pages and anonymous denial of protected pages and APIs. Credential-backed journeys for each role run when the `E2E_*` variables are supplied. Full Auth, Storage, Realtime, provider, and load validation requires a configured Supabase stack and external credentials.
