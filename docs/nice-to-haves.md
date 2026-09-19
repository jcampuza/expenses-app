# Nice-to-haves

Small follow-ups that would improve navigation, but are not required for the Solid 2 cutover.

## Hover preload for connection pages

The previous TanStack Router + TanStack Query stack prefetched route data on link hover. Convex’s React client exposes the same idea as [`prewarmQuery`](https://docs.convex.dev/api/classes/react.ConvexReactClient#prewarmquery): subscribe now, keep the subscription alive for ~5 seconds (`extendSubscriptionFor`), then drop it if the user never navigates.

We already keep the last query snapshot in `src/lib/convex.ts` so returning to a connection page can render immediately while a live `onUpdate` resubscribes. Hover preload would fill that snapshot *before* the click.

A small implementation that fits this adapter:

1. Export a `prewarmQuery(client, query, args)` helper that calls `client.onUpdate(...)`, writes the snapshot cache on the first value, and unsubscribes after 5 seconds (cancel the timer if the page mounts and subscribes for real).
2. On `pointerenter` / `focus` of dashboard connection links (`ConnectionListItem`), prewarm `api.expenses.getSharedExpenses` with that `connectionId`. `getCurrentUserAuthenticated` is usually already live on the dashboard.
3. Skip prefetch on coarse pointers if it feels noisy; the snapshot cache still covers back/forward navigation.

Do not add a second cache (TanStack Query, etc.). One snapshot map plus Convex’s existing subscription dedupe is enough.
