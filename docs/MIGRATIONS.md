# Migrations

Migrations are ordered, immutable schema steps under `supabase/migrations`:

1. Foundation
2. Auth and RBAC
3. Companies, Client HR, and jobs
4. Checklists and publishing
5. Student CVs and applications
6. CV parsing and scoring
7. HR verification
8. Client submission
9. Mock interviews
10. Client interviews
11. Feedback, offers, and placement
12. Notifications and analytics
13. Security consolidation
14. Performance indexes
15. Production release controls
16. Atomic notification claiming
17. Recovery contracts and final RLS hardening

For a disposable local database, run `npm run db:test:local`. The harness creates an in-process Postgres-compatible database, applies every migration from zero, and runs applicable SQL tests. With Docker and the Supabase CLI available, run `npx supabase db reset` for the full local stack.

Production deployments must apply only pending migrations in filename order. Do not rewrite or squash migrations already applied to an environment. Back up the database, confirm the current migration ledger, apply changes in a maintenance window when needed, then run the release and production smoke checks.
