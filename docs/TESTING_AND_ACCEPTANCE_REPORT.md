# Testing and Acceptance Report

Acceptance matrix: **113 total — 26 PASS, 0 FAIL, 87 BLOCKED**.

PASS means an automated local/full-Postgres test directly exercised the stated result. BLOCKED means implementation exists but the complete acceptance assertion still needs seeded authenticated users, the linked target, a provider, or representative load. No row is promoted from source review alone.

| ID | Area | Acceptance requirement | Evidence | Status |
| --- | --- | --- | --- | --- |
| AT-001 | Authentication / account lifecycle | Pending user cannot enter protected dashboard. | src/lib/auth/guards.ts; src/proxy.ts; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-002 | Authentication / account lifecycle | Approved Admin reaches Admin dashboard. | src/lib/auth/guards.ts; src/proxy.ts; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-003 | Authentication / account lifecycle | Approved Placement HR reaches Placement dashboard. | src/lib/auth/guards.ts; src/proxy.ts; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-004 | Authentication / account lifecycle | Approved Client HR reaches Client dashboard. | src/lib/auth/guards.ts; src/proxy.ts; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-005 | Authentication / account lifecycle | Approved Student reaches Student dashboard. | src/lib/auth/guards.ts; src/proxy.ts; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-006 | Authentication / account lifecycle | Rejected/suspended/inactive accounts route to correct state page. | src/lib/auth/guards.ts; src/proxy.ts; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-007 | Authentication / account lifecycle | Unauthorized role route access returns redirect/403 as intended. | src/lib/auth/guards.ts; src/proxy.ts; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-008 | Authentication / account lifecycle | User cannot self-assign role. | src/lib/auth/guards.ts; src/proxy.ts; tests/e2e/access.spec.ts | **PASS** |
| AT-009 | Tenant isolation | Client HR A cannot read Company B submissions/candidates/interviews/placements/CVs. | supabase/tests/stage17_tenant_isolation.sql; scoped repositories | **BLOCKED** |
| AT-010 | Tenant isolation | Placement HR A cannot manage Job B assigned to Placement HR B. | supabase/tests/stage17_tenant_isolation.sql; scoped repositories | **BLOCKED** |
| AT-011 | Tenant isolation | Student A cannot read Student B applications/CV/mock/interview/offer data. | supabase/tests/stage17_tenant_isolation.sql; scoped repositories | **BLOCKED** |
| AT-012 | Tenant isolation | Service-role-backed repositories still enforce the above. | supabase/tests/stage17_tenant_isolation.sql; scoped repositories | **BLOCKED** |
| AT-013 | Company/job/checklist/publish | Verified company can be used for Client HR/job. | migrations 3-4; company/job/checklist services | **BLOCKED** |
| AT-014 | Company/job/checklist/publish | Invalid/inactive company blocked where required. | migrations 3-4; company/job/checklist services | **BLOCKED** |
| AT-015 | Company/job/checklist/publish | Job creates in expected state. | migrations 3-4; company/job/checklist services | **BLOCKED** |
| AT-016 | Company/job/checklist/publish | AI checklist can be generated when configured. | migrations 3-4; company/job/checklist services | **BLOCKED** |
| AT-017 | Company/job/checklist/publish | Checklist can be edited/approved. | migrations 3-4; company/job/checklist services | **BLOCKED** |
| AT-018 | Company/job/checklist/publish | Publish without approved checklist is rejected. | migrations 3-4; company/job/checklist services | **BLOCKED** |
| AT-019 | Company/job/checklist/publish | Published job appears in Student feed. | migrations 3-4; company/job/checklist services | **BLOCKED** |
| AT-020 | Student/CV/apply | Non-existing HRAnalyst Student blocked from eligibility/creation according to flow. | migration 5; CV/application services and validators | **BLOCKED** |
| AT-021 | Student/CV/apply | PDF upload accepted within limits. | migration 5; CV/application services and validators | **BLOCKED** |
| AT-022 | Student/CV/apply | DOCX upload accepted within limits. | migration 5; CV/application services and validators | **BLOCKED** |
| AT-023 | Student/CV/apply | Unsupported/oversize upload rejected. | migration 5; CV/application services and validators | **BLOCKED** |
| AT-024 | Student/CV/apply | Primary CV selection is unique. | migration 5; CV/application services and validators | **BLOCKED** |
| AT-025 | Student/CV/apply | Historical CV attached to application cannot be destructively removed. | migration 5; CV/application services and validators | **BLOCKED** |
| AT-026 | Student/CV/apply | Student applies once. | migration 5; CV/application services and validators | **BLOCKED** |
| AT-027 | Student/CV/apply | Duplicate application rejected transactionally. | migration 5; CV/application services and validators | **BLOCKED** |
| AT-028 | Scoring | Match = 70/20/10 formula. | migration 6; tests/domain.test.ts | **PASS** |
| AT-029 | Scoring | ATS category weights = 20/30/20/15/15. | migration 6; tests/domain.test.ts | **PASS** |
| AT-030 | Scoring | Score range 0–100. | migration 6; tests/domain.test.ts | **PASS** |
| AT-031 | Scoring | Requirement evidence stored. | migration 6; tests/domain.test.ts | **BLOCKED** |
| AT-032 | Scoring | Browser cannot call protected score mutation RPC directly. | migration 6; tests/domain.test.ts | **PASS** |
| AT-033 | Scoring | Failed scoring can retry without losing application. | migration 6; tests/domain.test.ts | **BLOCKED** |
| AT-034 | Verification | Assigned Placement HR can claim. | migration 7; verification services; tests/domain.test.ts | **BLOCKED** |
| AT-035 | Verification | Another Placement HR cannot steal active claim. | migration 7; verification services; tests/domain.test.ts | **BLOCKED** |
| AT-036 | Verification | Claim expires/releases correctly. | migration 7; verification services; tests/domain.test.ts | **BLOCKED** |
| AT-037 | Verification | Verify creates immutable history. | migration 7; verification services; tests/domain.test.ts | **BLOCKED** |
| AT-038 | Verification | Reject requires reason. | migration 7; verification services; tests/domain.test.ts | **PASS** |
| AT-039 | Verification | Request Update requires instructions. | migration 7; verification services; tests/domain.test.ts | **BLOCKED** |
| AT-040 | Verification | Verified score override becomes effective score. | migration 7; verification services; tests/domain.test.ts | **PASS** |
| AT-041 | Verification | Verified Match 59 blocks client submission. | migration 7; verification services; tests/domain.test.ts | **PASS** |
| AT-042 | Verification | Verified Match 60 allows eligibility. | migration 7; verification services; tests/domain.test.ts | **PASS** |
| AT-043 | Client submission | Multi-candidate submission succeeds atomically. | migration 8; submission services | **BLOCKED** |
| AT-044 | Client submission | One invalid candidate rolls entire transaction back. | migration 8; submission services | **BLOCKED** |
| AT-045 | Client submission | Candidate snapshot does not change when Student later edits profile. | migration 8; submission services | **BLOCKED** |
| AT-046 | Client submission | Client notification queued. | migration 8; submission services | **BLOCKED** |
| AT-047 | Client submission | CV signed URL expires and is company-scoped. | migration 8; submission services | **BLOCKED** |
| AT-048 | Mock | Placement HR creates slot. | migration 9; mock services and routes | **BLOCKED** |
| AT-049 | Mock | Student books own eligible application only. | migration 9; mock services and routes | **BLOCKED** |
| AT-050 | Mock | Double booking prevented. | migration 9; mock services and routes | **BLOCKED** |
| AT-051 | Mock | Cancel/rebook works. | migration 9; mock services and routes | **BLOCKED** |
| AT-052 | Mock | Scorecard submitted and version history retained. | migration 9; mock services and routes | **BLOCKED** |
| AT-053 | Mock | Internal notes hidden from Student. | migration 9; mock services and routes | **BLOCKED** |
| AT-054 | Mock | Client interview blocked without completed mock/submitted scorecard. | migration 9; mock services and routes | **BLOCKED** |
| AT-055 | Client shortlist/interview | Client HR can shortlist own-company candidate. | migration 10; interview services | **BLOCKED** |
| AT-056 | Client shortlist/interview | Reject requires reason. | migration 10; interview services | **PASS** |
| AT-057 | Client shortlist/interview | Other-company candidate cannot be decided. | migration 10; interview services | **BLOCKED** |
| AT-058 | Client shortlist/interview | Interview round number is server-derived. | migration 10; interview services | **BLOCKED** |
| AT-059 | Client shortlist/interview | Round 2 can be scheduled after Round 1 completion. | migration 10; interview services | **BLOCKED** |
| AT-060 | Client shortlist/interview | Duplicate active round prevented. | migration 10; interview services | **BLOCKED** |
| AT-061 | Client shortlist/interview | Candidate overlap prevented. | migration 10; interview services | **BLOCKED** |
| AT-062 | Client shortlist/interview | Client-HR overlap prevented. | migration 10; interview services | **BLOCKED** |
| AT-063 | Client shortlist/interview | Reschedule history retained. | migration 10; interview services | **BLOCKED** |
| AT-064 | Client shortlist/interview | Cancellation restores correct eligibility state. | migration 10; interview services | **BLOCKED** |
| AT-065 | Client shortlist/interview | Schedule notification/calendar event queued. | migration 10; interview services | **BLOCKED** |
| AT-066 | Feedback | Feedback only against completed eligible interview. | migration 11; feedback services | **BLOCKED** |
| AT-067 | Feedback | Latest round rule enforced. | migration 11; feedback services | **BLOCKED** |
| AT-068 | Feedback | Selected works. | migration 11; feedback services | **BLOCKED** |
| AT-069 | Feedback | Rejected requires comments/reason as designed. | migration 11; feedback services | **BLOCKED** |
| AT-070 | Feedback | On Hold works. | migration 11; feedback services | **BLOCKED** |
| AT-071 | Feedback | Revision creates immutable prior revision. | migration 11; feedback services | **BLOCKED** |
| AT-072 | Feedback | Student sees only intended feedback fields. | migration 11; feedback services | **BLOCKED** |
| AT-073 | Offer | Offer only for selected eligible application. | migration 11; offer services; stage13_security.sql | **BLOCKED** |
| AT-074 | Offer | Private PDF offer upload. | migration 11; offer services; stage13_security.sql | **BLOCKED** |
| AT-075 | Offer | One active offer per application. | migration 11; offer services; stage13_security.sql | **BLOCKED** |
| AT-076 | Offer | Student Accept => `offer_accepted`, not `placed`. | migration 11; offer services; stage13_security.sql | **PASS** |
| AT-077 | Offer | Student Decline returns to selected/replacement-offer eligibility. | migration 11; offer services; stage13_security.sql | **BLOCKED** |
| AT-078 | Offer | HR withdrawal returns to selected when placement not confirmed. | migration 11; offer services; stage13_security.sql | **BLOCKED** |
| AT-079 | Offer | Offer file signed access authorization passes/fails correctly. | migration 11; offer services; stage13_security.sql | **BLOCKED** |
| AT-080 | Placement | Placement cannot be confirmed without accepted offer. | migration 11; placement services; stage13_security.sql | **BLOCKED** |
| AT-081 | Placement | Student cannot confirm own placement. | migration 11; placement services; stage13_security.sql | **BLOCKED** |
| AT-082 | Placement | Assigned Placement HR/Admin can confirm placement. | migration 11; placement services; stage13_security.sql | **BLOCKED** |
| AT-083 | Placement | Confirmation creates placement + application `placed` atomically. | migration 11; placement services; stage13_security.sql | **BLOCKED** |
| AT-084 | Placement | Placement history exists. | migration 11; placement services; stage13_security.sql | **BLOCKED** |
| AT-085 | Placement | Joined/deferred/backout/revoked/closed transitions obey allowed matrix. | migration 11; placement services; stage13_security.sql | **BLOCKED** |
| AT-086 | Notifications/operations | Worker atomically claims jobs. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **PASS** |
| AT-087 | Notifications/operations | Concurrent worker does not duplicate same outbox delivery. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **PASS** |
| AT-088 | Notifications/operations | Retry increments attempts. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **PASS** |
| AT-089 | Notifications/operations | Terminal failures become dead-letter according to canonical rules. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **PASS** |
| AT-090 | Notifications/operations | Stale `processing` recovery works. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-091 | Notifications/operations | Dedupe key prevents duplicate logical notification. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **PASS** |
| AT-092 | Notifications/operations | In-app notification read/read-all works. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-093 | Notifications/operations | Cron rejects invalid secret with 401. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **PASS** |
| AT-094 | Notifications/operations | Internal worker failure returns actionable 500 rather than false success. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-095 | Notifications/operations | Operational alert cron is idempotent/deduplicated. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-096 | Notifications/operations | 24h feedback overdue and 48h escalation detectable. | migrations 12/16; stage12_notification_delivery.sql; tests/e2e/access.spec.ts | **BLOCKED** |
| AT-097 | Analytics/reports | Funnel counts match seeded truth set. | analytics/report services; tests/domain.test.ts | **BLOCKED** |
| AT-098 | Analytics/reports | Feedback SLA statuses match test clock/data. | analytics/report services; tests/domain.test.ts | **BLOCKED** |
| AT-099 | Analytics/reports | Submission turnaround calculation correct. | analytics/report services; tests/domain.test.ts | **BLOCKED** |
| AT-100 | Analytics/reports | Placement summary uses final placement schema/status names. | analytics/report services; tests/domain.test.ts | **BLOCKED** |
| AT-101 | Analytics/reports | Client analytics is tenant-scoped. | analytics/report services; tests/domain.test.ts | **BLOCKED** |
| AT-102 | Analytics/reports | Student analytics is own-data only. | analytics/report services; tests/domain.test.ts | **BLOCKED** |
| AT-103 | Analytics/reports | CSV export escapes spreadsheet formula injection (`=`, `+`, `-`, `@`, etc.). | analytics/report services; tests/domain.test.ts | **PASS** |
| AT-104 | Fresh build/release | `npm ci` succeeds from lockfile. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **PASS** |
| AT-105 | Fresh build/release | `npm run typecheck` succeeds. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **PASS** |
| AT-106 | Fresh build/release | `npm run lint` succeeds. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **PASS** |
| AT-107 | Fresh build/release | `npm run build` succeeds. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **PASS** |
| AT-108 | Fresh build/release | fresh Supabase reset/migrations succeed. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **BLOCKED** |
| AT-109 | Fresh build/release | SQL tests pass. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **PASS** |
| AT-110 | Fresh build/release | unit/integration/E2E tests pass. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **BLOCKED** |
| AT-111 | Fresh build/release | no zero-byte required implementation files. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **PASS** |
| AT-112 | Fresh build/release | no unresolved local imports. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **PASS** |
| AT-113 | Fresh build/release | no runtime-required undocumented environment variables. | local gate run 2026-09-15; TESTING_AND_ACCEPTANCE_REPORT.md | **PASS** |

## Executed suites

- Clean `npm ci`: PASS.
- Vitest: 23 tests after company-domain and ATS additions; run again in the final gate.
- Embedded migrations 1–19 and SQL suite: PASS; only `slow_queries.sql` is skipped by PGlite.
- Real Supabase/PostgreSQL: reset through 17, forward migrations 18–19 applied, and all 30 SQL files including `slow_queries.sql` PASS.
- TypeScript, lint, production build and route-link verification: final gate recorded in `FINAL_RECOVERY_REPORT.md`.
- Playwright: credential-free access/private-file/cron checks plus credential-gated role journeys.

## Blocked acceptance work

Supply seeded E2E accounts and provider credentials, deploy pending migrations to the linked target, then run the role workflow suite and performance scripts. The application is not declared production-ready until critical BLOCKED rows pass.
