# Deployment Runbook

1. Create a database backup and record the deployed revision and migration ledger.
2. Install from the lockfile and run links, unit, migration, type, lint, build, and browser gates.
3. Confirm production environment variables and provider credentials without printing their values.
4. Apply pending migrations in filename order and regenerate database types if the linked schema differs.
5. Deploy the standalone Next.js build with Node.js and configure the notification and operations cron schedules.
6. Run `npm run release:check` and `npm run smoke:production` with the production check variables.
7. Verify login, one representative journey per role, private file access, notification delivery, audit events, and operational alerts.
8. Monitor error rate, queue depth, dead-letter growth, latency, and database health.

If validation fails, stop new traffic or roll back the application revision. Database rollback should use a reviewed forward repair migration or a tested backup restore; do not delete migration history from a live environment.
