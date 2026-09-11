# HRAnalyst Placement Wing — Stage 2 Audit and Apply Guide

## Scope
Stage 2 covers authentication, session refresh, role-based access, account-state routing, Admin user creation/approval, invite/password reset flow, and the foundational RLS policies required by those operations.

## Corrected Stage 2 architecture
- Next.js 16 `src/proxy.ts` refreshes Supabase SSR auth cookies.
- Canonical clients are only in `src/lib/supabase/`.
- `getCurrentUser()` verifies the auth user and resolves roles explicitly from `user_roles` + `roles`.
- Guards accept one role or an array of roles.
- Account states route to pending/rejected/suspended/inactive pages.
- Admin creates users on the trusted server using Supabase Admin invite APIs.
- Student creation requires external HRAnalyst enrollment verification.
- Client HR creation requires an active verified company and matching email domain when the company has a domain.
- Approval re-checks role prerequisites before setting `profiles.account_status=approved`.
- Browser roles have read-only access to foundational identity/RBAC tables; privileged mutations use trusted server code.

## Stage 2 migration order
1. `supabase/migrations/202609080001_stage01_foundation.sql`
2. `supabase/migrations/202609080002_stage02_auth_rbac.sql`

## Supabase Auth setup
Read `SUPABASE_AUTH_EMAIL_TEMPLATES.md` and configure Invite + Recovery email templates before testing invitations/password reset.

## Required env values for Stage 2
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferred) OR `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HRANALYST_STUDENT_VERIFY_URL` for creating Student users
- `HRANALYST_STUDENT_VERIFY_TOKEN` if the upstream verifier requires bearer auth

The PRD requires an external HRAnalyst enrollment check but does not define its HTTP contract. This code uses the documented adapter contract in `.env.example`: POST `{ "enrollment_id": "..." }`; expected response `{ "exists": true, "student": {...} }`. Adapt only `src/services/students/student-verification.service.ts` if your real upstream API differs.

## Obsolete files removed
- `src/middleware.ts`
- `src/lib/middleware.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/server.ts`
- `src/lib/client.ts`

## Stage 2 tests
Run the database migration, then execute `supabase/tests/stage02_auth_rbac.sql`.

For application validation run:
```bash
npm install
npm run typecheck
npm run lint
npm run build
```

The original ZIP contains syntax/empty-file defects owned by later stages. A whole-repository build can therefore still fail until those later stages are audited. Stage 2-owned files in this package have no zero-byte files and no dangling `@/` imports.

## Bootstrap first Super Admin
After applying Stage 1 + Stage 2 migrations:
```bash
BOOTSTRAP_SUPER_ADMIN_EMAIL="admin@example.com" \
BOOTSTRAP_SUPER_ADMIN_PASSWORD="replace-with-a-strong-password" \
node scripts/bootstrap-super-admin.mjs
```
Use a real secure password through environment variables; never commit it.
