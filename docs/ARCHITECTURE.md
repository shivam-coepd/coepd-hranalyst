# Architecture

HRAnalyst Placement Wing is a Next.js 16 App Router application backed by Supabase Postgres, Auth, Storage, and Realtime. Pages and route handlers call server-side services; services enforce workflow rules and use repositories for data access. Browser code uses only the publishable Supabase client.

Authorization is layered. `src/proxy.ts` refreshes sessions and applies security headers. Server guards verify authentication, account approval, and one of five roles: Super Admin, Placement Admin, Placement HR, Client HR, or Student. Postgres row-level security is the final boundary. Placement HR access follows assigned jobs, Client HR access follows company ownership, and Student access follows the authenticated student's profile.

Database migrations are the authoritative schema and workflow definition. They enforce status transitions, unique active records, scoring and submission gates, audit trails, and notification delivery ownership. Private CV and offer files are accessed through short-lived signed URLs.

The notification worker atomically claims due messages with `FOR UPDATE SKIP LOCKED`, fences completion to the claiming worker, retries with backoff, and moves exhausted messages to `dead_letter`.

The build produces a standalone Next.js server. Runtime dependencies are Supabase plus any enabled external services described in `EXTERNAL_INTEGRATIONS.md`.
