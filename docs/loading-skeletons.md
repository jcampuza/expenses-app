### Loading skeletons for dynamic loading features

This guide describes how we implement loading skeletons when data is fetched dynamically (e.g., via `useSuspenseQuery` + `convexQuery`) so only the relevant area displays a loader, not the entire page.

## Goals

- **Localize loading**: Wrap only the smallest meaningful sub-tree (e.g., a tab pane, a card list, or a dialog body) in a `Suspense` boundary.
- **Avoid layout shift**: Skeletons should roughly match the rendered layout’s size.
- **Keep the scaffold visible**: Headers, tabs, and surrounding UI remain interactive while content loads.

## Where to place Suspense boundaries

- **Tab panes**: Wrap each tab’s content, not the entire tabs container.
- **Dialog content**: Wrap the dialog body that loads form data.
- **Lists and sections**: Wrap the list/section that suspends, not the entire page.

Example (tab panes):

```tsx
import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExpensesTabContent } from "./ExpensesTabContent";
import { ConnectionActivityFeed } from "./ConnectionActivityFeed";
import { ExpensesTabSkeleton, ActivityTabSkeleton } from "./YourSkeletons";

export function ExampleTabs({ connectionId }: { connectionId: string }) {
  return (
    <Tabs defaultValue="expenses">
      <TabsList>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="expenses">
        <Suspense fallback={<ExpensesTabSkeleton />}>
          <ExpensesTabContent connectionId={connectionId as any} />
        </Suspense>
      </TabsContent>

      <TabsContent value="activity">
        <Suspense fallback={<ActivityTabSkeleton />}>
          <ConnectionActivityFeed connectionId={connectionId as any} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
```

Example (dialog content):

```tsx
import { Suspense } from "react";
import { DialogContent } from "@/components/ui/dialog";
import { LoadingFormComponent } from "@/components/LoadingComponent";
import { AddExpenseForm } from "./AddExpenseForm";

export function AddExpenseDialogBody(props: any) {
  return (
    <DialogContent>
      <Suspense fallback={<LoadingFormComponent />}>
        <AddExpenseForm {...props} />
      </Suspense>
    </DialogContent>
  );
}
```

## Building skeletons

- **Primitive**: Use `Skeleton` from `src/components/ui/skeleton.tsx`.
- **Composed skeletons**: Build feature-specific skeletons (e.g., `SkeletonCard`, `ExpensesTabSkeleton`) using the primitive. Keep sizes close to final UI.
- **Placement**:
  - Shared shapes: `src/components/ui/skeleton.tsx` and `src/components/Skeletons.tsx`.
  - Feature-specific: Near the feature component or co-located in the same file when small.

Example (feature skeletons):

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/Skeletons";

export function ExpensesTabSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-full" />
      <div className="my-4" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    </div>
  );
}

export function ActivityTabSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="mt-2 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Query strategy inside Suspense

- **Co-locate queries**: Put the `useSuspenseQuery` calls inside the component that sits within the boundary. Each boundary should fully satisfy its own data needs.
- **Parent vs child data**: If parent data is required to render headers or the page scaffold, fetch it above the boundaries so only the child content suspends.

## Accessibility and UX

- **Animation**: Our skeletons use `animate-pulse`. Keep it subtle to avoid distraction.
- **Focus and keyboard**: Maintain tabs and controls outside the suspended region so navigation remains usable.
- **Dimensions**: Match final layout dimensions to prevent content jump when data resolves.

## Do and don’t

- **Do**: Wrap the smallest meaningful component subtree that suspends.
- **Do**: Create tailored skeletons that mirror the final layout.
- **Don’t**: Wrap entire pages or layouts in a single boundary—this causes full-page loaders.
- **Don’t**: Use a one-size-fits-all skeleton for complex views.

## Naming and file placement

- **Skeleton components**: `FeatureAreaSkeleton` (e.g., `ExpensesTabSkeleton`).
- **Shared primitives**: Keep in `src/components/ui/skeleton.tsx` and `src/components/Skeletons.tsx`.
- **Feature-specific skeletons**: Co-locate near the feature component or in the same file if small and reused only there.

## Checklist

- **Boundary**: Add a `Suspense` boundary around the smallest dynamic section.
- **Fallback**: Provide a feature-appropriate skeleton.
- **Client component**: Ensure the parent that renders `Suspense` is a `"use client"` component.
- **Queries**: Use `useSuspenseQuery` inside the boundary and avoid leaking suspension to higher levels.
- **Verify**: Switch between tabs/sections to confirm only the content area shows the loader.
