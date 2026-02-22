# ExpenseMate

ExpenseMate is a React 19 + Vite single-page app with a Convex backend and Clerk authentication for shared expense tracking.

## Tech Stack

- Frontend: Vite, React, TanStack Router, TanStack Query, Tailwind CSS
- Backend: Convex
- Auth: Clerk
- Tooling: Bun, TypeScript, ESLint, Prettier

## Local Development

1. Install dependencies:

```bash
bun install
```

2. Configure env vars in `.env.local` (see `.env.example`).

3. Run the app and Convex dev server together:

```bash
bun run dev
```

4. Open `http://localhost:3000`.

## Quality Checks

```bash
bun run lint
bun run typecheck
bun test
```

## Deployment

Cloudflare Workers is the target platform.

- `wrangler.jsonc` serves the built SPA from `dist` with SPA fallback routing.
- `bun run cf:build` chains Convex deployment and frontend build:
  - `bunx convex deploy --cmd 'bun run build'`
- `bun run cf:deploy` deploys with Wrangler.

### Environment Model

- Preview branches: use shared dev Convex values.
- Production: use production Convex values.

Set the following in Cloudflare environment-specific settings:

- `CONVEX_DEPLOYMENT`
- `CONVEX_DEPLOY_KEY`
- `VITE_CONVEX_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`

Set Convex runtime variables in Convex env:

- `CLERK_FRONTEND_API_URL`
- `FX_RATES_API_KEY`

## Legacy Vercel Config

`vercel.json` is intentionally kept during migration for rollback safety. Remove it once Cloudflare production is fully validated.
