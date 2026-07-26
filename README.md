# ExpenseMate

ExpenseMate is a Vite + TanStack Router single-page app that uses Clerk for authentication and Convex for backend data and realtime updates.

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

These are not part of the static frontend deployment, but may still be used by other local workflows.

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

Deployments are managed entirely from the Vercel dashboard:

- production deploys come from `main`
- every other branch and pull request gets a Vercel preview deployment
- build command is `bun run build`, output directory is `dist/`
- SPA fallback is handled by Vercel's Vite framework preset, so direct loads of TanStack Router routes like `/dashboard` work

Set `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_FRONTEND_API_URL`, and `VITE_CONVEX_URL` per environment in the Vercel project settings. Do not put `CLERK_SECRET_KEY` in the frontend build environment.

`.github/workflows/build.yml` runs lint, typecheck, format check, and build on pushes to `main` and pull requests. It does not deploy.

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

- This repository is a client-rendered TanStack Router app, not a TanStack Start app.
- The Vercel deployment only serves static assets and the SPA fallback; all backend logic lives in Convex.
</content>
</invoke>
