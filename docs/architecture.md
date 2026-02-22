## Expenses App Architecture

### Overview

ExpenseMate is a Vite-powered React SPA that uses Convex for backend logic/data and Clerk for authentication.
Users create 1:1 connections, record shared expenses, and track balances in USD.

### Runtime Model

- Frontend: static assets built by Vite and served by Cloudflare Workers assets.
- Routing: TanStack Router on the client (SPA fallback required in hosting).
- Backend: Convex functions (queries/mutations/actions/crons).
- Auth: Clerk in the React app + Convex auth provider config.

### Tech Stack

- Frontend: React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS, Radix UI
- Backend: Convex
- Auth: Clerk
- Tooling: Bun, TypeScript, ESLint, Prettier

## Directory Structure

```text
convex/                 # Convex schema, functions, cron jobs, auth config
src/app/                # TanStack Router file-based routes
src/components/         # App-level components
src/components/ui/      # UI primitives
src/hooks/              # App hooks
src/lib/                # Shared utilities/clients
scripts/                # Local development scripts
```

## Data Model (Convex)

Defined in `convex/schema.ts`:

- `users`
- `user_connections`
- `invitations`
- `expenses`
- `user_expenses`
- `exchange_rates`

USD is canonical for balances. Non-USD expenses are converted via latest stored rates.

## Backend Modules (Convex)

- `user.ts`: current user queries + persistence.
- `connections.ts`: connected user list and connection detail.
- `invitations.ts`: invitation create/read/accept and expiration cleanup.
- `expenses.ts`: expense CRUD and split/conversion logic.
- `exchangeRates.ts`: fetch/store exchange rates and lookup latest rate.
- `crons.ts`: daily invitation cleanup and exchange-rate refresh.

## Frontend Data Flow

1. `src/main.tsx` creates app providers (Clerk + Convex + Query client).
2. Protected routes in `src/app/_authenticated/*` gate access by auth state.
3. On authenticated routes, `usePersistUserEffect` ensures user persistence in Convex.
4. Queries/mutations run through `@convex-dev/react-query` + TanStack Query.

## Environment and Configuration

### Frontend build-time variables

- `VITE_CONVEX_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`

### Convex deploy-time variables

- `CONVEX_DEPLOYMENT`
- `CONVEX_DEPLOY_KEY`

### Convex runtime variables

- `CLERK_FRONTEND_API_URL`
- `FX_RATES_API_KEY`

`convex/auth.config.ts` supports migration compatibility by resolving Clerk domain from:

1. `CLERK_FRONTEND_API_URL` (preferred)
2. `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`
3. `VITE_CLERK_FRONTEND_API_URL`

## Build and Deploy

- `bun run build`: Vite build.
- `bun run cf:build`: deploy Convex then build frontend.
- `bun run cf:deploy`: Wrangler deploy.
- `wrangler.jsonc`: Cloudflare Worker config with SPA fallback routing.

`vercel.json` is still present temporarily for rollback during migration.

## Local Development

- `bun run dev`: runs frontend + Convex dev process.
- `bun run dev:web`: frontend only.
- `bun run dev:convex`: Convex only.

## Testing and Validation

- `bun run lint`
- `bun run typecheck`
- `bun test`
