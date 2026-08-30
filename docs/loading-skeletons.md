### Loading skeletons for dynamic loading features

This guide describes how we implement loading skeletons when data is fetched dynamically (via `createQuery` from `src/lib/convex.ts`) so only the relevant area displays a loader, not the entire page.

## Goals

- **Localize loading**: Wrap only the smallest meaningful sub-tree (e.g., a card list or a dialog body) in a `<Loading>` boundary.
- **Avoid layout shift**: Skeletons should roughly match the rendered layout’s size.
- **Keep the scaffold visible**: Headers and surrounding UI remain interactive while content loads.

## Where to place Loading boundaries

- **Content sections**: Wrap content sections that load data dynamically.
- **Dialog content**: Wrap the dialog body that loads form data.
- **Lists and sections**: Wrap the list/section that suspends, not the entire page.

Example (expense content):

```tsx
import { Loading } from "solid-js";
import { ConnectionExpenseList } from "./ExpensesTabContent";
import { ConnectionExpenseListSkeleton } from "./ExpensesTabContent";

export function ExampleList(props: { connectionId: string }) {
  return (
    <Loading fallback={<ConnectionExpenseListSkeleton />}>
      <ConnectionExpenseList connectionId={props.connectionId} />
    </Loading>
  );
}
```

Example (dialog content):

```tsx
import { Loading } from "solid-js";
import { DialogContent } from "@/components/ui/dialog";
import { LoadingFormComponent } from "@/components/LoadingComponent";
import { AddExpenseForm } from "./AddExpenseForm";

export function AddExpenseDialogBody(props: { connectionId: string }) {
  return (
    <DialogContent>
      <Loading fallback={<LoadingFormComponent />}>
        <AddExpenseForm {...props} />
      </Loading>
    </DialogContent>
  );
}
```

## Building skeletons

- **Primitive**: Use `Skeleton` from `src/components/ui/skeleton.tsx`.
- **Composed skeletons**: Build feature-specific skeletons (e.g., `SkeletonCard`, `ConnectionExpenseListSkeleton`) using the primitive. Keep sizes close to final UI.
- **Placement**:
  - Shared shapes: `src/components/ui/skeleton.tsx` and `src/components/Skeletons.tsx`.
  - Feature-specific: Near the feature component or co-located in the same file when small.

Example (feature skeletons):

```tsx
import { Repeat } from "solid-js";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/Skeletons";

export function ConnectionExpenseListSkeleton() {
  return (
    <div>
      <Skeleton class="h-9 w-full" />
      <div class="my-4" />
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Repeat count={6}>
          <SkeletonCard />
        </Repeat>
      </div>
    </div>
  );
}
```

## Query strategy inside Loading

- **Co-locate queries**: Put the `createQuery` calls inside the component that sits within the boundary. Each boundary should fully satisfy its own data needs.
- **Parent vs child data**: If parent data is required to render headers or the page scaffold, fetch it above the boundaries so only the child content waits.

## Accessibility and UX

- **Animation**: Our skeletons use `animate-pulse`. Keep it subtle to avoid distraction.
- **Focus and keyboard**: Maintain controls outside the loading region so navigation remains usable.
- **Dimensions**: Match final layout dimensions to prevent content jump when data resolves.

## Do and don’t

- **Do**: Wrap the smallest meaningful component subtree that waits on async data.
- **Do**: Create tailored skeletons that mirror the final layout.
- **Don’t**: Wrap entire pages or layouts in a single boundary—this causes full-page loaders.
- **Don’t**: Use a one-size-fits-all skeleton for complex views.

## Naming and file placement

- **Skeleton components**: `FeatureAreaSkeleton` (e.g., `ConnectionExpenseListSkeleton`).
- **Shared primitives**: Keep in `src/components/ui/skeleton.tsx` and `src/components/Skeletons.tsx`.
- **Feature-specific skeletons**: Co-locate near the feature component or in the same file if small and reused only there.

## Checklist

- **Boundary**: Add a `<Loading>` boundary around the smallest dynamic section.
- **Fallback**: Provide a feature-appropriate skeleton.
- **Queries**: Use `createQuery` inside the boundary and avoid leaking pending state to higher levels.
- **Verify**: Confirm only the content area shows the loader while the surrounding chrome stays visible.
