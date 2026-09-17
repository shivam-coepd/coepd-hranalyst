# API Contract

Generated from the current Next.js route handlers. Zod schemas validate request payloads in route or service boundaries; authorization is rechecked by server services and database RPCs/RLS.

| Route | Methods | Primary boundary | Source |
| --- | --- | --- | --- |
| `/api/admin/uat` | POST | Authenticated role guard | `api/admin/uat/route.ts` |
| `/api/admin/uat/[runId]/tests/[testCode]` | PATCH | Authenticated role guard | `api/admin/uat/[runId]/tests/[testCode]/route.ts` |
| `/api/applications` | POST | Authenticated role guard | `api/applications/route.ts` |
| `/api/applications/[id]/score` | POST | Service-level authorization | `api/applications/[id]/score/route.ts` |
| `/api/applications/[id]/verification/claim` | POST | Service-level authorization | `api/applications/[id]/verification/claim/route.ts` |
| `/api/applications/[id]/verification/finalize` | POST | Service-level authorization | `api/applications/[id]/verification/finalize/route.ts` |
| `/api/applications/[id]/verification/release` | POST | Service-level authorization | `api/applications/[id]/verification/release/route.ts` |
| `/api/checklists/[id]` | PATCH | Service-level authorization | `api/checklists/[id]/route.ts` |
| `/api/checklists/[id]/approve` | POST | Service-level authorization | `api/checklists/[id]/approve/route.ts` |
| `/api/client/candidates/[id]/cv` | GET | Service-level authorization | `api/client/candidates/[id]/cv/route.ts` |
| `/api/client/candidates/[id]/decision` | POST | Service-level authorization | `api/client/candidates/[id]/decision/route.ts` |
| `/api/client/interviews` | GET, POST | Service-level authorization | `api/client/interviews/route.ts` |
| `/api/client/interviews/[id]` | GET | Service-level authorization | `api/client/interviews/[id]/route.ts` |
| `/api/client/interviews/[id]/cancel` | POST | Service-level authorization | `api/client/interviews/[id]/cancel/route.ts` |
| `/api/client/interviews/[id]/complete` | POST | Service-level authorization | `api/client/interviews/[id]/complete/route.ts` |
| `/api/client/interviews/[id]/reschedule` | POST | Service-level authorization | `api/client/interviews/[id]/reschedule/route.ts` |
| `/api/companies` | GET, POST | Service-level authorization | `api/companies/route.ts` |
| `/api/companies/[id]/active` | POST | Service-level authorization | `api/companies/[id]/active/route.ts` |
| `/api/companies/[id]/reject` | POST | Service-level authorization | `api/companies/[id]/reject/route.ts` |
| `/api/companies/[id]/verify` | POST | Service-level authorization | `api/companies/[id]/verify/route.ts` |
| `/api/cron/notifications` | POST | Cron secret | `api/cron/notifications/route.ts` |
| `/api/cron/operations` | POST | Cron secret | `api/cron/operations/route.ts` |
| `/api/feedbacks` | POST | Service-level authorization | `api/feedbacks/route.ts` |
| `/api/feedbacks/[id]/revise` | POST | Service-level authorization | `api/feedbacks/[id]/revise/route.ts` |
| `/api/health` | GET | Public health check | `api/health/route.ts` |
| `/api/jobs` | GET, POST | Service-level authorization | `api/jobs/route.ts` |
| `/api/jobs/[id]` | GET, PATCH | Service-level authorization | `api/jobs/[id]/route.ts` |
| `/api/jobs/[id]/checklist/generate` | POST | Service-level authorization | `api/jobs/[id]/checklist/generate/route.ts` |
| `/api/jobs/[id]/publish` | POST | Service-level authorization | `api/jobs/[id]/publish/route.ts` |
| `/api/jobs/[id]/submit` | POST | Service-level authorization | `api/jobs/[id]/submit/route.ts` |
| `/api/mocks` | POST | Service-level authorization | `api/mocks/route.ts` |
| `/api/mocks/[id]/cancel` | POST | Service-level authorization | `api/mocks/[id]/cancel/route.ts` |
| `/api/mocks/[id]/scorecard` | POST | Service-level authorization | `api/mocks/[id]/scorecard/route.ts` |
| `/api/mocks/[id]/start` | POST | Service-level authorization | `api/mocks/[id]/start/route.ts` |
| `/api/mocks/book` | POST | Service-level authorization | `api/mocks/book/route.ts` |
| `/api/mocks/slots` | POST | Service-level authorization | `api/mocks/slots/route.ts` |
| `/api/notifications` | GET | Service-level authorization | `api/notifications/route.ts` |
| `/api/notifications/[id]/read` | POST | Service-level authorization | `api/notifications/[id]/read/route.ts` |
| `/api/notifications/read-all` | POST | Service-level authorization | `api/notifications/read-all/route.ts` |
| `/api/offers` | POST | Authenticated role guard | `api/offers/route.ts` |
| `/api/offers/[id]/file` | GET | Service-level authorization | `api/offers/[id]/file/route.ts` |
| `/api/offers/[id]/withdraw` | POST | Service-level authorization | `api/offers/[id]/withdraw/route.ts` |
| `/api/perf/application/[id]` | GET | Service-level authorization | `api/perf/application/[id]/route.ts` |
| `/api/perf/notification-worker` | POST | Service-level authorization | `api/perf/notification-worker/route.ts` |
| `/api/perf/student-feed` | GET | Service-level authorization | `api/perf/student-feed/route.ts` |
| `/api/perf/verification-queue` | GET | Service-level authorization | `api/perf/verification-queue/route.ts` |
| `/api/placements/[id]/close` | POST | Service-level authorization | `api/placements/[id]/close/route.ts` |
| `/api/placements/[id]/joined` | POST | Service-level authorization | `api/placements/[id]/joined/route.ts` |
| `/api/placements/[id]/transition` | POST | Service-level authorization | `api/placements/[id]/transition/route.ts` |
| `/api/placements/confirm` | POST | Authenticated role guard | `api/placements/confirm/route.ts` |
| `/api/readiness` | GET | Service-level authorization | `api/readiness/route.ts` |
| `/api/reports/[type]` | GET | Authenticated role guard | `api/reports/[type]/route.ts` |
| `/api/student/cvs/[id]` | DELETE | Service-level authorization | `api/student/cvs/[id]/route.ts` |
| `/api/student/cvs/[id]/download` | GET | Service-level authorization | `api/student/cvs/[id]/download/route.ts` |
| `/api/student/cvs/[id]/primary` | POST | Service-level authorization | `api/student/cvs/[id]/primary/route.ts` |
| `/api/student/cvs/complete` | POST | Service-level authorization | `api/student/cvs/complete/route.ts` |
| `/api/student/cvs/upload-url` | POST | Service-level authorization | `api/student/cvs/upload-url/route.ts` |
| `/api/student/offers/[id]/decision` | POST | Service-level authorization | `api/student/offers/[id]/decision/route.ts` |
| `/api/student/profile` | PATCH | Service-level authorization | `api/student/profile/route.ts` |
| `/api/submissions` | POST | Service-level authorization | `api/submissions/route.ts` |
| `/auth/callback` | GET | Supabase auth callback | `auth/callback/route.ts` |
| `/auth/confirm` | GET | Supabase auth callback | `auth/confirm/route.ts` |

Mutation handlers return 400 for invalid input or workflow state, 401 for missing authentication/invalid cron authorization, 403 for denied role or scope, 404 for inaccessible records where disclosure would leak existence, and masked 500 responses with a request ID for internal failures.
