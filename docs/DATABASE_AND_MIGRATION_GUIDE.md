# Database and Migration Guide

Migrations are the schema source of truth and must run in filename order. The final schema version is **19.0**.

| Version | Migration | Purpose |
| --- | --- | --- |
| 1 | `202609080001_stage01_foundation.sql` | Identity, roles, companies, profiles, audit foundation |
| 2 | `202609080002_stage02_auth_rbac.sql` | Auth lifecycle and RBAC |
| 3 | `202609080003_stage03_companies_client_hr_jobs.sql` | Canonical companies, Client HR, jobs |
| 4 | `202609080004_stage04_checklist_publish.sql` | Checklist versions, approval, publication |
| 5 | `202609080005_stage05_student_cv_apply.sql` | Student CVs and transactional applications |
| 6 | `202609080006_stage06_cv_parsing_scoring.sql` | Parsed CVs, scores, evidence, retry runs |
| 7 | `202609080007_stage07_hr_verification.sql` | Claim/expiry and immutable verification |
| 8 | `202609080008_stage08_client_submission.sql` | Transactional snapshot submissions |
| 9 | `202609080009_stage09_mock_interviews.sql` | Mock slots, booking and scorecard versions |
| 10 | `202609090010_stage10_client_interviews.sql` | Client decisions, rounds and scheduling history |
| 11 | `202609090011_stage11_feedback_offer_placement.sql` | Feedback, offers and explicit placement |
| 12 | `202609090012_stage12_notifications_analytics.sql` | Outbox, notifications, analytics and operations |
| 13 | `202609090013_stage13_security_consolidation.sql` | Canonical state/security consolidation |
| 14 | `202609090014_stage14_performance_indexes.sql` | Query indexes |
| 15 | `202609090015_stage15_production_release.sql` | Releases, UAT and health records |
| 16 | `202609090016_notification_claiming.sql` | Atomic outbox claim and fenced completion |
| 17 | `202609090017_recovery_contracts.sql` | Provisioning contracts and final tenant RLS |
| 18 | `202609090018_public_privilege_hardening.sql` | Remove anonymous grants, browser DML and direct view access |
| 19 | `202609150019_schema_alignment_patch.sql` | Additive repair for older deployed company/profile schemas |

For a disposable database:

```powershell
npx supabase start
npx supabase db reset
npm run db:test:local
npm run db:types:local
```

For an existing linked environment, review pending changes first and back up the database:

```powershell
npx supabase db push --dry-run
npx supabase db push
```

Migration 19 is deliberately additive and idempotent because the reported remote database is older than the recovered baseline. Never remove applied migration ledger entries. Use a reviewed forward repair or tested backup restore for production recovery.
