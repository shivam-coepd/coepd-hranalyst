# Local Development

Install Node.js and npm, then create `.env.local` from `.env.example` with a development Supabase project.

```powershell
npm ci
npm run db:test:local
npm run dev
```

Open `http://localhost:3000`. Use `npm run typecheck`, `npm run lint`, and `npm test` while developing. Run `npm run build` before handing off a change.

For the complete Supabase service stack, install Docker and the Supabase CLI, start Docker, then run `npx supabase start` and `npx supabase db reset`. Generate linked production types only with an intentionally selected Supabase project; the offline migrated-catalog generator is available through `npm run db:types:local`.
