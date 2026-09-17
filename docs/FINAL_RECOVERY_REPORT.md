# Final Recovery Report

## Executive summary

Recovery date: 2026-09-15. Baseline checkpoint: `16b9f78`. Current status: implementation recovered, migration chain at schema **19.0**, local quality gates passing, and linked-remote deployment plus credential/provider/load acceptance pending. Production readiness decision: **NOT READY** until the critical BLOCKED acceptance rows are executed successfully.

## Original blockers and repaired modules

| Area | Original problem | Repair | Evidence | Status |
| --- | --- | --- | --- | --- |
| Source tree | 102 missing/empty candidates and duplicate helpers | Recovered candidates; consolidated proxy, clients and services | Inventory, typecheck, build | PASS |
| Database | Ambiguous order, Stage 12/13 conflicts and type drift | Ordered migrations, corrected states, generated types | Embedded migration suite | PASS |
| Company creation | Connected deployment lacked canonical extended columns including `address` | Idempotent migration 19 and exact insert regression | `stage19_company_schema_alignment.sql` | PASS locally; deployment pending |
| API privileges | Supabase defaults gave `anon` public-table privileges | Migration 18 revokes anonymous access, browser DML and direct views | Full PostgreSQL `stage18_privilege_hardening.sql` | PASS |
| Offer/placement | Student acceptance could be confused with placement | `offer_received -> offer_accepted -> placed`; explicit confirmation | Stage 13 transition test | PASS |
| Notifications | Unsafe concurrent work and inconsistent terminal state | Atomic claim, fenced completion, retry/backoff and dead letter | Stage 12 behavior test | PASS |
| Private files | Sensitive access needed a uniform boundary | Private buckets and scoped 60/300-second signed URLs | SQL privacy and anonymous E2E | PASS for local negative path |
| UI/routes | Missing role pages and later UI changes produced lint errors | Restored routes, shared UI/navigation, corrected lint/accessibility issues | 133-route inventory, lint/build | PASS |

New recovery modules include missing role pages/APIs/components, scoring/verification/submission services, PDF parsing, publication broadcasting, migration/type/test generators, Vitest/Playwright configuration, SQL contracts, migrations 16–19, performance tooling, and the required recovery documentation.

## Database and security changes

Migrations 1–19 cover foundation, Auth/RBAC, companies/jobs, checklists, CV/applications, scoring, verification, Client submissions, mocks, interviews, feedback/offers/placements, notifications/analytics, security, indexes, releases, notification claims, recovery contracts, public privilege hardening, and legacy deployment alignment.

Server guards require approved accounts and one of five canonical roles. RLS enforces Student ownership, Client company scope and Placement HR assignment scope. Service-role repositories repeat scope checks. Authenticated clients cannot directly mutate public tables; `anon` has no public-schema table/function privilege. CV and offer files remain private.

## Business flow

All eleven PRD steps have implementation routes, services, RPCs, history/audit and notification producers. Match uses 70/20/10; ATS uses 20/30/20/15/15. Submission requires verified status and effective Match >=60. Mock completion/current scorecard gates Client interviews. Rounds are server-derived. Student offer acceptance does not create placement.

## Test results

| Suite | Passed | Failed | Skipped/blocked | Notes |
| --- | ---: | ---: | ---: | --- |
| Vitest | 23 | 0 | 0 | Scoring, gates, routing, offers, CSV and company-domain validation |
| Embedded migrations | 19 | 0 | 0 | Fresh chain from zero |
| Embedded SQL files | 29 | 0 | 1 | `slow_queries.sql` requires `pg_stat_statements` |
| Full Supabase/PostgreSQL SQL files | 30 | 0 | 0 | Includes `pg_stat_statements` and migrations 18–19 |
| Playwright | 4 | 0 | 4 | Role journeys require configured accounts |
| TypeScript / ESLint / build | 3 gates | 0 | 0 | Build generated 83 pages |
| Acceptance matrix | 26 | 0 | 87 | 113 total; conservative direct-test standard |

## Performance

Stage 14 adds indexes for feed, verification, submissions, interviews, notification claims and operational queries. Query-plan SQL passes on full PostgreSQL. Load fixtures target 1,000 Students and enforce configurable p95/p99/error thresholds. No compliance claim is made until `npm run perf:all` runs against representative seeded infrastructure.

## Environment and remaining blockers

Required base runtime names are `NEXT_PUBLIC_SUPABASE_URL`, one public Supabase key, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_APP_URL`. OpenAI, Student registry, SMTP/channel, cron, E2E and performance variables are required only for their corresponding workflows; the complete contract is in `ENVIRONMENT_CONFIGURATION.md`.

Remaining release blockers:

1. Review and deploy migrations 18–19 to the linked Supabase project; migration 19 fixes the reported `companies.address` schema-cache error.
2. Run seeded authenticated journeys for Admin, Placement HR, Client HR and Student, including cross-tenant and private-file positive/negative cases.
3. Validate configured Student registry, OpenAI, email/calendar and optional notification providers.
4. Run and retain the representative 1,000-Student performance report.

The Supabase CLI completed a real local reset through migration 17. Windows Application Control later blocked that downloaded CLI executable, so migrations 18–19 were applied and tested directly against the running local Supabase PostgreSQL container. The embedded harness independently applied all 19 from zero.

## Deployment procedure

```powershell
npm ci
npm run verify:links
npm test
npm run db:test:local
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npx supabase db push --dry-run
npx supabase db push
```

After deployment, run `npm run release:check`, `npm run smoke:production`, credential-backed Playwright and `npm run perf:all`. Keep a database backup and the previous application artifact available for rollback.

## Production readiness decision

**NOT READY.** There is no known failing P0/P1 implementation gate locally, but the linked database still needs the schema repair and 87 behavioral acceptance rows remain blocked by authenticated target/provider/load validation. Do not promote until those critical rows pass.
