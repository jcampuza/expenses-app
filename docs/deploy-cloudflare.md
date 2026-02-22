## Cloudflare Workers Deployment

This project deploys as a static SPA on Cloudflare Workers with Convex as backend.

## Required Files

- `wrangler.jsonc`: Worker config and SPA fallback.
- `package.json` scripts:
  - `cf:build`
  - `cf:deploy`
  - `cf:deploy:dry-run`

## Cloudflare Workers Builds Setup

1. Connect this repo in Cloudflare Workers Builds.
2. Set build command to:

```bash
bun install --frozen-lockfile && bun run cf:build
```

3. Ensure the deployment uses `wrangler.jsonc` from repo root.

## Environment Variables

Configure environment-scoped vars in Cloudflare:

### Preview

- `CONVEX_DEPLOYMENT` (dev)
- `CONVEX_DEPLOY_KEY` (dev)
- `VITE_CONVEX_URL` (dev)
- `VITE_CLERK_PUBLISHABLE_KEY` (preview/dev)

### Production

- `CONVEX_DEPLOYMENT` (prod)
- `CONVEX_DEPLOY_KEY` (prod)
- `VITE_CONVEX_URL` (prod)
- `VITE_CLERK_PUBLISHABLE_KEY` (prod)

## Convex Runtime Variables

Set these in each Convex deployment:

- `CLERK_FRONTEND_API_URL`
- `FX_RATES_API_KEY`

## Clerk Domain Setup

Add the Cloudflare preview and production domains to Clerk allowed origins/redirects.

## Smoke Test Checklist

1. Open `/`, `/dashboard`, `/settings`, and a deep connection route directly.
2. Refresh deep routes and confirm no 404 (SPA fallback works).
3. Sign in/out using Clerk on preview and production hosts.
4. Create an expense in preview and verify it appears only in dev Convex.
5. Create an expense in production and verify it appears only in prod Convex.

## Rollback

Keep `vercel.json` and Vercel deployment available until Cloudflare production is stable.
If needed, switch DNS back to Vercel while investigating.
