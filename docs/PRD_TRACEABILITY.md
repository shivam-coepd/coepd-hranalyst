# PRD Traceability

| PRD domain | Implementation evidence | Verification |
| --- | --- | --- |
| Authentication and accounts | Auth callback, login/recovery flows, account-state routing, user administration | Type/build gates; public and anonymous Playwright checks |
| Roles and permissions | Server guards, service-role scope checks, RLS policies for five roles | `stage13_security.sql`, `stage17_tenant_isolation.sql` |
| Companies and Client HR | Company verification, company-user links, client job and candidate views | Stage 3 SQL contracts; role-scoped repositories |
| Jobs and checklists | Draft/submit/approve/publish flow and generated/editable checklists | Stage 3–4 SQL contracts; route matrix |
| Student profiles and CVs | Profile updates, PDF/DOCX parsing, primary CV, private storage access | Stage 5 SQL contracts; type/build gates |
| Applications and scoring | Apply, ATS/match calculation, verified overrides, status history | Stage 5–7 SQL contracts; unit scoring tests |
| HR verification | Claim/finalize queue and verified-score handling | Stage 7 and concurrency SQL contracts |
| Client submissions | 60 percent gate, submit/withdraw, scoped client CV access | Stage 8 SQL contracts; unit eligibility tests |
| Mock interviews | Schedule, scorecards, completion and scoring | Stage 9 SQL contracts |
| Client interviews and feedback | Schedule/reschedule/cancel/complete, feedback and revisions | Stage 10–11 SQL contracts |
| Offers and placements | Offer file, accept/reject/withdraw, joining and closure workflow | Stage 11/17 contracts; offer unit tests |
| Notifications | In-app/email/channel delivery, atomic workers, retry and dead letter | Stage 12 delivery SQL contract |
| Analytics, reports, UAT, releases | Role dashboards, CSV reports, UAT runs, release gates | Link/type/build gates; CSV injection unit test |
| Security and operations | Audit, rate limits, headers, health/readiness, operational alerts | Security SQL contracts; anonymous API denial tests |

All locally executable gates pass. Integration claims that require Docker, seeded authenticated users, external providers, or load targets remain listed in `KNOWN_LIMITATIONS.md`.
