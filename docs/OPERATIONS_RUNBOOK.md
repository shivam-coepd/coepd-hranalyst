# Operations Runbook

Monitor application errors, Supabase health, notification queue age, retry counts, dead-letter messages, failed provider deliveries, security events, and release/UAT status. Correlate API failures with the returned request ID.

For a stuck notification queue, confirm cron authorization and provider configuration, inspect queued and claimed timestamps, and check delivery attempts. Claims expire safely for retry; fenced completion prevents an old worker from overwriting a newer claim. Resolve the provider issue before replaying dead-letter entries.

For access incidents, disable or suspend the affected account, inspect audit and security events, review role and company/job assignments, and rotate exposed credentials. Validate the relevant RLS probe before restoring access.

For migration incidents, preserve logs and the migration ledger, stop additional deployment steps, and use a reviewed forward repair or tested backup restore. For performance regressions, capture the route, payload, query plan, and environment, then run the supplied load scripts against a non-production dataset.
