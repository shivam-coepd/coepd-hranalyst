# Current Repository Audit

Audit date: 2026-09-15. Target: `S:\COEPD HRAnalyst\hranalyst-placement`. The PRD and supplied recovery package were read from the parent workspace and treated as read-only evidence.

## Baseline and recovery findings

The original tree mixed partial Stage implementations, duplicated Supabase clients/middleware, missing routes and services, stale generated database types, ambiguous migration filenames, incomplete Stage 12/13 validation, and build suppressions. One hundred and two missing or empty candidate files were recovered and reconciled rather than copied as a complete alternate tree.

The 2026-09-15 live-company failure exposed a second deployment drift: application code wrote canonical extended company fields while the connected remote schema lacked `companies.address`. The additive migration `202609150019_schema_alignment_patch.sql` aligns old deployments. A full local Supabase run also exposed default public privileges that allowed `anon` to select `audit_logs`; migration 18 now removes anonymous public-schema access, browser DML, and browser access to owner-executed analytics views.

## Current structure

- Next.js 16.3.4 App Router and React 19.2.8 under `src/app`.
- 131 application routes, including 62 route handlers. Generated inventories are `ROUTE_MATRIX.json` and `API_CONTRACT.md`.
- Canonical Supabase clients under `src/lib/supabase`; `src/proxy.ts` refreshes auth cookies and adds security headers.
- Services hold business rules; repositories hold scoped data access. Service-role paths explicitly derive actor/company/student/job scope.
- Nineteen ordered migrations, 59 generated relations, 60 generated functions, SQL tests, Vitest unit tests, Playwright tests, release scripts, and load fixtures.

## Static audit result

- No zero-byte implementation file.
- No unresolved local import after typecheck/build.
- No `@ts-nocheck`, build-error suppression, production placeholder, or canonical `mock_evaluator` role.
- Canonical company columns are `name`, `domain`, `website`, `size`, and `logo`; legacy names are migration inputs only.
- `applications.student_id` references `student_profiles.id`.
- CV and offer buckets are private; signed URLs are issued only after server authorization.
- One canonical notification outbox remains.

## Verification boundary

The embedded migration harness applies migrations 1–19 from zero. Docker Supabase also reset through migration 17, then migrations 18–19 and all SQL files passed directly against PostgreSQL, including `pg_stat_statements`. The CLI executable was subsequently blocked by Windows Application Control, so a second CLI-driven reset containing 18–19 could not be launched; the from-zero embedded run and real-Postgres forward application cover both paths.

Credential-backed role journeys, configured OpenAI/registry/provider calls, linked-remote migration deployment, and representative performance load remain separate environment gates. See `TESTING_AND_ACCEPTANCE_REPORT.md`.
