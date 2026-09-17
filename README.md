# HRAnalyst Placement Wing

Next.js 16 and Supabase application for the complete placement lifecycle: account approval, companies and jobs, AI checklists, Student CVs and applications, scoring, HR verification, Client submission, mocks, interviews, feedback, offers, placements, notifications, analytics, and operations.

## Requirements

- Node.js 22+
- npm
- Docker Desktop and Supabase CLI for the full local stack

## Local setup

```powershell
Copy-Item .env.example .env.local
npm ci
npx supabase start
npx supabase db reset
npm run dev
```

Populate `.env.local` with the local Supabase values printed by `supabase start`. Never commit that file. OpenAI and the HRAnalyst verification service are required only for their respective workflows; SMTP, Telegram, and WhatsApp channels are configuration controlled.

## Verification

```powershell
npm test
npm run db:test:local
npm run typecheck
npm run lint
npm run build
```

`db:test:local` applies every migration from zero to an embedded PostgreSQL-compatible database and runs the SQL structural and behavior suite. Run `npx supabase db reset` as the final Auth, Storage, Realtime, and extension check whenever Docker is available.

Operational and deployment instructions are in [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md), [docs/TESTING.md](docs/TESTING.md), and [docs/DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md).

The canonical recovered schema is version 19.0. Existing deployments that predate the canonical extended company fields must apply `202609150019_schema_alignment_patch.sql`; it adds fields such as `companies.address` without removing data.

Recovery evidence is in [docs/FINAL_RECOVERY_REPORT.md](docs/FINAL_RECOVERY_REPORT.md), [docs/PRD_IMPLEMENTATION_TRACEABILITY.md](docs/PRD_IMPLEMENTATION_TRACEABILITY.md), and [docs/TESTING_AND_ACCEPTANCE_REPORT.md](docs/TESTING_AND_ACCEPTANCE_REPORT.md). These reports distinguish locally proven checks from target-environment acceptance still awaiting credentials or load infrastructure.
