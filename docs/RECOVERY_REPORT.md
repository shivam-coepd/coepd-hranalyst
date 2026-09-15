# Recovery Report

## Outcome

The Placement Wing was reconstructed on `recovery/full-project-rebuild-2026-09-12` from the clean repository baseline and the recoverable staged snapshots available during the audit. The recovery restored 102 missing or empty candidate files, reconciled the application with an ordered 17-migration schema, removed duplicate implementations and build suppressions, and completed the missing end-to-end domain surfaces.

## Material repairs

- Established migrations 1–19 as the schema source of truth and generated database TypeScript types from the migrated catalog. Migrations 18 and 19 harden API-role privileges and repair older deployed schemas.
- Enforced the offer sequence `offer_received -> offer_accepted -> placed` and retained terminal notification `dead_letter` handling.
- Added atomic notification claims with row locking, attempt tracking, ownership fencing, retry backoff, and dead-letter exhaustion.
- Reconciled scoring with the canonical 70/20/10 calculation and the 60 percent client-submission gate.
- Added explicit job/company/user scope checks wherever service-role access bypasses RLS.
- Restricted CV and offer access to short-lived signed URLs and normalized API failures to mask internal 5xx detail.
- Removed duplicate middleware, Supabase clients, application services, stale patch scripts, `@ts-nocheck`, and build-error suppression.

## Verification result

The current local gate set passes: 71 page-link patterns, 23 unit tests, all 19 migrations from zero in the embedded harness, every SQL contract on full PostgreSQL including cross-tenant and privilege probes, TypeScript, ESLint with zero warnings, the production build with 83 pages, and four credential-free Playwright tests. Four role journeys are present and skip without configured E2E credentials. The production dependency audit reports zero vulnerabilities.

## Remaining environment checks

Docker Supabase reset successfully through migration 17; migrations 18–19 and every SQL file then passed against its PostgreSQL container, including `pg_stat_statements`. A later Windows Application Control block prevented a second CLI reset. Authenticated browser journeys, linked deployment, provider delivery, and load measurements require their documented environment and credentials.

The source stage directories visible during the initial recovery disappeared from the parent workspace after an environment retry. No delete or move command was issued against them. Their recovered content remains in this branch; this report and the generated inventory preserve the resulting checkpoint.
