# ExpenseMate

ExpenseMate is a Vite + Solid 2.0 single-page app that uses Clerk for authentication and Convex for backend data and realtime updates.

## Requirements

- Bun
- A Clerk application
- A Convex deployment
- A Vercel account for hosting

## Commands

```bash
bun install
bun run dev          # web + convex together
bun run dev:web      # Vite app only
bun run dev:convex   # Convex functions only
bun run lint
bun run typecheck
bun run check        # lint + typecheck + format check
bun run format:check
bun run format:write
bun run test
bun run build
bun run build:staging
bun run start
```

## Environment Variables

Copy `.env.example` to `.env.local` for local development and provide the required values.

### Frontend build-time variables

These values are embedded into the Vite build and must be present anywhere you run `bun run build`, including in the Vercel project's environment variables.

```bash
VITE_CLERK_PUBLISHABLE_KEY=
VITE_CLERK_FRONTEND_API_URL=
VITE_CONVEX_URL=
```

### Other variables

These are CLI/server variables and are not embedded into the frontend bundle. Vercel uses `CONVEX_DEPLOY_KEY` to authenticate its Convex deployment.

```bash
CLERK_SECRET_KEY=
CONVEX_DEPLOY_KEY=
CONVEX_DEPLOYMENT=
```

## Build Modes

This repo uses Vite env modes for frontend deployment targets:

- `bun run build` uses production values from `.env.production`
- `bun run build:staging` uses staging values from `.env.staging`

## Local Development

Install dependencies:

```bash
bun install
```

Run the app and Convex together:

```bash
bun run dev
```

Run only the frontend:

```bash
bun run dev:web
```

Run only Convex:

```bash
bun run dev:convex
```

## Production Build

Create the production frontend bundle:

```bash
bun run build
```

Preview the Vite production build locally:

```bash
bun run start
```

## Deployment

The app deploys to Vercel as a static SPA. Clerk and Convex remain external services.

Frontend deployments are managed from the Vercel dashboard:

- production deploys come from `main`
- every other branch and pull request gets a Vercel preview deployment
- build command is `bunx convex deploy --cmd 'bun run build' --cmd-url-env-var-name VITE_CONVEX_URL`, output directory is `dist/client`
- SPA fallback is handled by `vercel.json`, so direct loads of routes like `/dashboard` work
- `vercel.json` also pins `framework` to `vite` so Vercel does not keep treating this as the previous TanStack Start app

If an existing Vercel project still has a TanStack Start (or other SSR) framework preset, switch it to Vite or Other and set the output directory to `dist/client`. Preview deploys need the same `VITE_*` env vars as production.

Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_CLERK_FRONTEND_API_URL` per environment in the Vercel project settings. The Convex deployment command supplies `VITE_CONVEX_URL` to the frontend build for the selected backend. Do not put `CLERK_SECRET_KEY` in the frontend build environment.

Set `CONVEX_DEPLOY_KEY` in Vercel with a production deploy key scoped to **Production** and a preview deploy key scoped to **Preview**. Preview builds use separate Convex backends for their branches. See the [Convex Vercel deployment guide](https://docs.convex.dev/production/hosting/vercel) for key setup and preview environment variables.

`.github/workflows/build.yml` runs lint, typecheck, format check, tests, and build on pushes to `main` and pull requests. It does not deploy.

The checked-in Vercel command runs the frontend build with the selected Convex URL, deploys the Convex functions after a successful build, and then lets Vercel publish the frontend. Keep `bun run build` as the frontend-only command for local builds and CI. Both expense forms require `expenses.getSharedExpenses` to return `user._id` alongside `user.name`; verify that field after deploying so frontend and backend versions stay compatible.

## Production Cutover Checklist

Before switching traffic to a new deployment, verify:

- `VITE_CLERK_PUBLISHABLE_KEY` points to the correct Clerk application
- `VITE_CLERK_FRONTEND_API_URL` points to the correct Clerk frontend API/domain
- `VITE_CONVEX_URL` points to the correct Convex production deployment
- Clerk allows the Vercel hostname and final custom domain
- Clerk sign-in and redirect URLs include the deployed frontend origin
- direct loads of `/`, `/dashboard`, `/dashboard/connection/:connectionId`, and `/settings` work
- Convex queries, mutations, and realtime updates work from the deployed origin

## Notes

- This repository is a client-rendered Solid 2.0 SPA, not a SolidStart SSR app.
- The Vercel deployment only serves static assets and the SPA fallback; all backend logic lives in Convex.
</content>
</invoke>
