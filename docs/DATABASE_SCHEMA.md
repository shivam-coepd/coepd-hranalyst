# Database Schema

Applying migrations 1 through 17 creates 59 relations and 60 public functions. Generated TypeScript bindings are in `src/types/database.ts`.

Core identity tables include `profiles`, `user_roles`, `companies`, `client_hr_companies`, and `students`. Recruiting tables include `jobs`, `job_assignments`, `job_checklists`, `student_cvs`, `applications`, `application_scores`, `application_status_history`, `client_submissions`, `mock_interviews`, `interviews`, `interview_feedbacks`, `offers`, and `placements`. Operations tables cover notifications, delivery attempts, audit events, rate limits, releases, UAT, and operational alerts.

The `students` row references the authenticated profile and stores verified placement data, including current and expected CTC. Company display names are sourced through company relationships rather than duplicated identity data.

Database constraints and triggers protect workflow invariants. Examples include one primary CV per student, score and percentage ranges, allowed status transitions, the 60 percent client-submission threshold, and the offer sequence `offer_received` to `offer_accepted` to `placed`.

RLS is enabled on tenant and user data. Security-definer functions have explicit search paths and validate caller role or ownership before privileged work.
