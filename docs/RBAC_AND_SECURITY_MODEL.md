# RBAC and Security Model

Canonical roles are `super_admin`, `admin`, `placement_hr`, `client_hr`, and `student`. `mock_evaluator` is not a platform role. Protected use requires an approved active account.

| Role | Scope |
| --- | --- |
| Super Admin | Platform-wide users, companies, jobs, operations and release controls |
| Admin | Platform administration and global placement workflow authority |
| Placement HR | Assigned jobs and their applications, submissions, mocks, interviews, offers and placements |
| Client HR | Linked-company jobs, submitted candidates, decisions, interviews, feedback and placement reads |
| Student | Own profile, CVs, applications, mocks, interviews, offers and placement data; published jobs |

`src/proxy.ts` refreshes auth cookies. Server guards resolve the current profile, account state and roles. Zod validates mutation inputs. Services and repositories apply actor and tenant filters before privileged queries. Postgres RLS repeats ownership boundaries.

Migration 18 hardens Supabase API-role privileges: `anon` has no public-schema table or function access; `authenticated` has no direct public-table DML or direct analytics-view access. Required audited RPCs retain explicit execute grants. Storage remains governed independently by private-bucket policies.

Security-definer functions use a fixed `search_path`, derive the caller with `auth.uid()`, check role/scope, and minimize grants. API 5xx errors are masked and carry request IDs. Audit logs exclude secrets and private document contents.
