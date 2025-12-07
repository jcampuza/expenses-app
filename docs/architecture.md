## Expenses App – Architecture

### Overview

ExpenseMate is a Next.js App Router application with a Convex backend. It lets authenticated users create “connections” (1:1 pairs), log shared expenses (optionally in foreign currencies), and see per-connection balances in USD. Authentication is handled by Clerk. Currency conversion is performed using daily exchange rates stored in Convex.

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TanStack Query 5, Tailwind CSS 4, Radix UI
- **Auth**: Clerk
- **Backend**: Convex (functions, database, crons)
- **Data fetching**: `@convex-dev/react-query` integration with TanStack Query
- **Language/Tooling**: TypeScript, ESLint, Prettier, Bun

### High-level Flow

1. User signs in with Clerk. On protected routes, we persist/update the user in Convex.
2. Users create connections (via invitations) to pair with another user.
3. Within a connection, either user records an expense. If the expense currency is not USD, it is converted to USD using the latest stored exchange rate.
4. The app stores line items for each participant in `user_expenses`, enabling per-user balances and connection totals.
5. Background jobs refresh exchange rates daily and clean up expired invitations.

## Directory Structure

```
convex/                 # Convex backend: schema, functions, crons, auth
  auth.config.ts        # Convex auth provider config (Clerk)
  crons.ts              # Daily jobs (exchange rates, invitation cleanup)
  exchangeRates.ts      # Fetch/store rates; queries for supported currencies
  expenses.ts           # Expense CRUD and conversion logic
  helpers.ts            # Common utility helpers (e.g., current user)
  invitations.ts        # Invitation create/accept/expire flows
  queries.ts            # Shared query helpers (connections, balances)
  connections.ts        # Connected users list and connection details
  schema.ts             # Database tables and indexes

src/
  app/
    (public)/           # Public routes (home, auth)
    (protected)/        # Guarded by middleware (dashboard, settings)
    RootProviders.tsx   # Providers: Clerk, Convex, TanStack Query
  components/           # UI components (Header, Footer, UI primitives)
  hooks/                # React hooks (persist user, mutations, toasts)
  lib/                  # Utilities and shared logic
```

## Data Model (Convex)

Defined in `convex/schema.ts`:

- **users**: `{ name, email?, tokenIdentifier }` index: `by_token_identifier`
- **user_connections**: `{ inviterUserId, inviteeUserId, acceptedAt }` indexes: `by_inviter_and_invitee`, `by_inviter`, `by_invitee`
- **invitations**: `{ token, inviterUserId, expirationTime, isUsed, createdAt }` index: `by_token`
- **expenses**: `{ name, date, category?, totalCost, currency, paidBy, originalCurrency?, originalTotalCost?, exchangeRate?, conversionDate? }`
- **user_expenses**: `{ userId, expenseId, amountPaid, amountOwed }` indexes: `by_user`, `by_expense`
- **exchange_rates**: `{ currency, rate, date }` indexes: `by_currency_and_date`, `by_date`

Notes:

- USD is the canonical currency for balances. If an expense is created in a foreign currency, the app looks up the most recent rate and stores both the original values and the converted USD values.
- Indexes are used to efficiently query by user, expense, or currency/date.

## Backend Modules (Convex)

### Auth and User

- `user.persist`: Creates/updates the `users` record based on Clerk identity.
- `user.getCurrentUserForPersistence`: Returns the user or `null` to drive persistence.
- `user.getCurrentUserAuthenticated`: Throws if unauthenticated; used on protected pages.

### Connections and Invitations

- `connections.getConnectedUsers`: Lists all paired users for the current user, with computed total balance per connection.
- `connections.getConnectionById`: Returns connection details.
- `invitations.getInvitation`: Validates an invitation token and returns inviter info.
- `invitations.acceptInvitation`: Marks invitation as used and inserts `user_connections`.
- `invitations.deleteExpiredInvitations` (internal): Used by cron to expire old invites.

### Expenses and Balances

- `expenses.addExpense`:
  - Validates the connection includes the current user.
  - If `currency !== "USD"`, finds latest `exchange_rates` for that currency.
  - Converts to USD via `usd = originalTotal / rate` (rate is foreign units per USD).
  - Inserts an `expenses` row and two `user_expenses` rows (payer and non-payer), calculating `amountPaid`/`amountOwed` depending on `splitEqually`.
- `expenses.updateExpense`:
  - Allows changing core fields and re-runs conversion if currency changes.
  - Patches the `expenses` row and updates `user_expenses` amounts.
- `expenses.getMyExpenses`: Convenience query for the current user’s expenses.
- `expenses.getSharedExpenses`: Lists shared items between the two connection users and computes a per-item balance plus a `totalBalance`.

### Exchange Rates

- `exchangeRates.fetchAndStoreExchangeRates` (internal action): Calls a 3rd-party API to fetch latest rates (base USD) for a supported set of currencies and stores them in `exchange_rates`.
- `exchangeRates.storeExchangeRates` (internal mutation): Upserts the daily batch.
- `exchangeRates.getLatestExchangeRate`: Returns `{ currency, rate, date }` for the requested currency (or `1` for USD).
- Supported currencies are defined in `exchangeRates.ts` (e.g., EUR, GBP, JPY, MXN, CAD, CNY).

### Background Jobs (Crons)

Defined in `convex/crons.ts`:

- Daily 06:00 UTC: `invitations.deleteExpiredInvitations`
- Daily 06:00 UTC: `exchangeRates.fetchAndStoreExchangeRates`

## Frontend Architecture

### Routing and Layouts

- Public routes under `src/app/(public)`; protected routes under `src/app/(protected)`.
- `src/middleware.ts` uses Clerk to redirect unauthenticated users away from protected routes and redirect authenticated users from public routes to `/dashboard`.
- Protected layout (`(protected)/layout.tsx`) waits for user persistence before rendering children.

### Providers and Data Fetching

- `src/app/RootProviders.tsx` wires up:
  - ClerkProvider (auth)
  - Convex React client + `@convex-dev/react-query` bridge
  - TanStack Query client using Convex queryFn/hashFn integration
- Queries are invoked via `convexQuery(api.module.fn, args)` and `useQuery`/`useSuspenseQuery` from TanStack Query.
- Mutations are called via a thin wrapper hook `src/hooks/use-convex-mutation.ts` which exposes `{ mutate, isPending, isSuccess, error }` and normalizes error handling.

### Key Screens

- Dashboard (`(protected)/dashboard`): Lists connected users and their `totalBalance` via `connections.getConnectedUsers`.
- Connection detail (`(protected)/dashboard/connection/[connectionId]`): Shows shared expenses, search, and an Add Expense flow which calls `expenses.addExpense`.
- Settings (`(protected)/settings`): Invitation generation, management, expiration; list of connections.

## Authentication & Authorization

- Clerk is embedded at the edge via `src/middleware.ts` and in the app via `RootProviders`.
- Server-side Convex functions check `ctx.auth.getUserIdentity()`; helper `getMeDocument` fetches the corresponding `users` row and throws on missing identity.
- Invitations and expense mutations validate that the current user belongs to the referenced connection.

## Environment & Configuration

Set these environment variables (local and deployment):

- `VITE_CONVEX_URL` – Convex deployment URL.
- `CLERK_DOMAIN` (or `VITE_CLERK_DOMAIN` for client) – Clerk frontend API domain (used by `convex/auth.config.ts`).
- `FX_RATES_API_KEY` – API key for exchange rate provider.

Build/Deploy:

- `vercel.json` sets a build command that runs `convex deploy` and then `bun run build`.
- `next.config.ts` enables the React Compiler experimental flag.

## Scripts & Local Development

- `bun run dev` – Local dev runner (Next + Convex via `scripts/dev.ts`).
- `bun run dev:next` / `bunx convex dev` – Run individually.
- `bun run typecheck`, `bun run lint`, `bun test` – Quality gates.

## Testing

- Example tests live in `src/lib/categories.test.ts`. Run with `bun test`.

## Performance and Data Integrity Notes

- All read paths that filter by user, expense, or currency use Convex indexes where appropriate (`by_user`, `by_expense`, `by_currency_and_date`).
- For currency conversion, the canonical balance accounting is in USD; original currency data is preserved on the expense for display/auditing.

## Extending the System

- Add new currencies: extend the `SUPPORTED_CURRENCIES` array and re-deploy; rates will populate on next cron.
- Add new derived views: prefer computing from `user_expenses` so that you don’t need to traverse all expenses for a user.
- Multi-party expenses: convert the `user_connections` model to a group construct and write N `user_expenses` rows per expense.
