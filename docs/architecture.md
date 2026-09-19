## Expenses App – Architecture

### Overview

ExpenseMate is a Vite single-page app built with Solid 2.0 and a Convex backend. It lets authenticated users create “connections” (1:1 pairs), log shared expenses (optionally in foreign currencies), and see per-connection balances in USD. Authentication is handled by Clerk. Currency conversion is performed using daily exchange rates stored in Convex.

### Tech Stack

- **Frontend**: Vite, Solid 2.0, `@solidjs/vite-plugin` (SPA start mode), `@solidjs/router` file routes, Tailwind CSS 4
- **Auth**: Clerk 6 and its modular `@clerk/ui`, wrapped in `src/lib/clerk.tsx`. The `no-rhc` entry points omit unused Clerk billing and Coinbase integrations; authentication modals load their UI chunks on demand.
- **Backend**: Convex (functions, database, crons)
- **Data fetching**: `ConvexClient` from `convex/browser` plus a thin Solid 2 adapter in `src/lib/convex.ts`
- **Language/Tooling**: TypeScript, ESLint, Prettier, Bun

### Session and rendering boundaries

`ConvexSessionProvider` owns one Convex client and component tree per Clerk session ID. Token refreshes retain that tree. Logout or switching sessions closes the old client and disposes its snapshots and form state. Query snapshot keys use Convex function names and serialized Convex values; a live `null` is authoritative.

Expense lists key rows by expense ID. Search filtering and the Fuse index are memoized separately, and edit forms own their draft values so server updates cannot reset unsaved input. Dialogs use native `showModal()` for focus containment and background inertness.

Run `bun run test:browser` after `bunx playwright install chromium` to check modal accessibility and draft preservation against fresh query snapshots. The isolated fixture uses a fake Convex client and needs no authentication credentials; it is not part of the production route tree. CI runs these tests as well as unit tests, lint, typecheck, and build.

### Backend linting and scale

Convex environment variables are declared in `convex/convex.config.ts` and read through the generated `env` export. Run `bunx convex codegen` after changing these declarations. Clerk's issuer URL is required; the FX key remains optional at deployment and is checked when the exchange-rate action runs.

Type-aware Convex linting checks access control and flags new collection scans. Existing scans that produce complete financial balances or process all invitations have documented, local exceptions. Scaling them requires maintained balance aggregates and resumable invitation batches; replacing them with a truncated `take()` would change correctness. TypeScript remains on 5.9 because the installed typescript-eslint release does not support TypeScript 7.

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
  App.tsx               # Providers, router, error boundary, toaster
  Document.tsx          # HTML document shell for start-mode SPA
  routes/               # File routes (landing, invite, authenticated app)
  components/           # UI components (Header, Footer, UI primitives)
  hooks/                # Client hooks (toasts, scroll direction)
  lib/                  # Convex adapter, Clerk wrapper, persist-user, utilities
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

- File routes live under `src/routes` and are served through `virtual:file-routes` + `@solidjs/router`.
- `/` and `/invite/:token` are public. Authenticated pages nest under the pathless `(app)` layout.
- Authenticated rendering waits on Clerk + Convex JWT auth, then the persist-user gate in `src/lib/persist-user.tsx`.

### Providers and Data Fetching

- `src/App.tsx` wires up:
  - ClerkProvider (auth)
  - ConvexProvider (`ConvexClient`)
  - ConvexClerkAuth (`setAuth` with the Clerk Convex JWT template)
  - PersistGate (ensure a Convex user row exists)
- Queries use `createQuery` (live `onUpdate` subscriptions) and render with `<Loading>` / `<Errored>` / `isPending`.
- Mutations use `createMutation` plus `createPendingFn` for button pending/error/toast state.

### Key Screens

- Dashboard (`src/routes/(app)/dashboard`): Lists connected users and their `totalBalance` via `connections.getConnectedUsers`.
- Connection detail (`src/routes/(app)/dashboard/connection/[connectionId].tsx`): Shows shared expenses, search, and an Add Expense flow which calls `expenses.addExpense`.
- Settings (`src/routes/(app)/settings.tsx`): Invitation generation, management, expiration; list of connections.

## Authentication & Authorization

- Clerk is initialized in the client via `src/lib/clerk.tsx`.
- Server-side Convex functions check `ctx.auth.getUserIdentity()`; helper `getMeDocument` fetches the corresponding `users` row and throws on missing identity.
- Invitations and expense mutations validate that the current user belongs to the referenced connection.

## Environment & Configuration

Set these environment variables (local and deployment):

- `VITE_CONVEX_URL` – Convex deployment URL.
- `VITE_CLERK_PUBLISHABLE_KEY` – Clerk publishable key.
- `CLERK_DOMAIN` (or `VITE_CLERK_DOMAIN` for client) – Clerk frontend API domain (used by `convex/auth.config.ts`).
- `FX_RATES_API_KEY` – API key for exchange rate provider.

Build/Deploy:

- Frontend builds run through `vite.config.ts` (`solid({ start: true })`).
- The static build output in `dist/client` is hosted on Vercel.

## Scripts & Local Development

- `bun run dev` – Local dev runner (Vite + Convex via `scripts/dev.ts`).
- `bun run dev:web` / `bun run dev:convex` – Run individually.
- `bun run typecheck`, `bun run lint`, `bun run test` – Quality gates.

## Testing

- Category suggestion tests live in `src/lib/categories.test.ts`.
- Convex adapter tests live in `src/lib/convex.test.ts`. Run with `bun test`.

## Performance and Data Integrity Notes

- All read paths that filter by user, expense, or currency use Convex indexes where appropriate (`by_user`, `by_expense`, `by_currency_and_date`).
- For currency conversion, the canonical balance accounting is in USD; original currency data is preserved on the expense for display/auditing.

## Extending the System

- Add new currencies: extend the `SUPPORTED_CURRENCIES` array and re-deploy; rates will populate on next cron.
- Add new derived views: prefer computing from `user_expenses` so that you don’t need to traverse all expenses for a user.
- Multi-party expenses: convert the `user_connections` model to a group construct and write N `user_expenses` rows per expense.
