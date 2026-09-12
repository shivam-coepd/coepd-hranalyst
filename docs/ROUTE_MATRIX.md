# Route Matrix

`ROUTE_MATRIX.json` is generated from every `page.tsx` and `route.ts` under `src/app`. It records the URL pattern, whether the entry is a page or API route, its broad audience, and source file.

Regenerate it after route changes:

```powershell
node scripts/generate-route-matrix.mjs
```

Authorization is enforced by server guards, scoped services/repositories, and RLS. The broad audience value is an inventory aid and is not an authorization policy.
