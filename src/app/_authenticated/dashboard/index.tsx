import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader } from "@/features/dashboard/DashboardContent";
import { DashboardSummarySkeleton } from "@/features/dashboard/DashboardContent";
import { DashboardSummary } from "@/features/dashboard/DashboardContent";
import { ConnectedUsersListSkeleton } from "@/features/dashboard/ConnectedUsersList";
import { ConnectedUsersList } from "@/features/dashboard/ConnectedUsersList";
import { Suspense } from "react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex grow flex-col gap-4 p-4 mx-auto w-full max-w-3xl">
      <DashboardHeader />

      <Suspense fallback={<DashboardSummarySkeleton />}>
        <DashboardSummary />
      </Suspense>

      <div className="mt-3">
        <div className="space-y-3">
          <Suspense fallback={<ConnectedUsersListSkeleton />}>
            <ConnectedUsersList />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
