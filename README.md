# ExpenseMate

ExpenseMate is a Vite + TanStack Router single-page app that uses Clerk for authentication and Convex for backend data and realtime updates.

## Requirements

- Bun
- A Clerk application
- A Convex deployment
- A Cloudflare account for production hosting

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
bun run cf:preview
bun run cf:preview:staging
bun run cf:deploy
bun run cf:deploy:staging
```

## Environment Variables

Copy `.env.example` to `.env.local` for local development and provide the required values.

### Frontend build-time variables

These values are embedded into the Vite build and must be present anywhere you run `bun run build`.

```bash
VITE_CLERK_PUBLISHABLE_KEY=
VITE_CLERK_FRONTEND_API_URL=
VITE_CONVEX_URL=
```

### Other variables

These are not part of the Cloudflare static frontend deployment, but may still be used by other local workflows.

```bash
CLERK_SECRET_KEY=
CONVEX_DEPLOY_KEY=
CONVEX_DEPLOYMENT=
```

## Build Modes

This repo uses Vite env modes for frontend deployment targets:

- `bun run build` uses production values from `.env.production`
- `bun run build:staging` uses staging values from `.env.staging`

Cloudflare Wrangler environments are configured to mirror those targets, but the deployed frontend values still come from the Vite build step.

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

## Cloudflare Workers Static Assets

This app deploys to Cloudflare as a static SPA. Clerk and Convex remain external services.

The Cloudflare config lives in `wrangler.jsonc` and is set up to:

- serve assets from `dist/`
- return `index.html` for unknown navigation routes
- support direct loads of TanStack Router routes like `/dashboard`
- define separate production and staging Wrangler environments
- expose non-secret runtime metadata via Wrangler `vars`

### First-time setup

Authenticate Wrangler:

```bash
bunx wrangler login
```

Verify the active account if needed:

```bash
bunx wrangler whoami
```

### Preview the Cloudflare deployment locally

Production preview:

```bash
bun run cf:preview
```

Staging preview:

```bash
bun run cf:preview:staging
```

### Deploy to Cloudflare

Production deploy:

```bash
bun run cf:deploy
```

Staging deploy:

```bash
bun run cf:deploy:staging
```

Start by validating the app on the generated `workers.dev` hostname before attaching a production custom domain.

### Wrangler environments

`wrangler.jsonc` defines:

- the default environment for production
- a `staging` environment override under `env.staging`
- non-secret `vars` for deployment metadata and public frontend values

Do not store secrets like `CLERK_SECRET_KEY` in Wrangler `vars`. Use Cloudflare secrets only if you later add a Worker script that actually needs them.

### GitHub Actions deployment

`.github/workflows/deploy-worker.yml` deploys:

- `main` pushes to the default production Worker
- all other branch pushes to the `staging` Wrangler environment
- manual runs to either target via `workflow_dispatch`

Configure these GitHub environment secrets in both `staging` and `production`:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Configure these GitHub environment variables in both `staging` and `production`:

- `VITE_CLERK_FRONTEND_API_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_CONVEX_URL`

The workflow selects the GitHub Environment automatically:

- `main` uses the `production` environment
- other branches use the `staging` environment
- manual runs use the environment chosen in `workflow_dispatch`

## Production Cutover Checklist

Before switching traffic to Cloudflare, verify:

- `VITE_CLERK_PUBLISHABLE_KEY` points to the correct Clerk application
- `VITE_CLERK_FRONTEND_API_URL` points to the correct Clerk frontend API/domain
- `VITE_CONVEX_URL` points to the correct Convex production deployment
- Clerk allows the Cloudflare hostname and final custom domain
- Clerk sign-in and redirect URLs include the deployed frontend origin
- direct loads of `/`, `/dashboard`, `/dashboard/connection/:connectionId`, and `/settings` work
- Convex queries, mutations, and realtime updates work from the deployed origin

## Notes

- This repository is a client-rendered TanStack Router app, not a TanStack Start app.
- Cloudflare Workers are only being used for static asset hosting and SPA fallback in this phase.
- No backend migration off Convex is included in this setup.
