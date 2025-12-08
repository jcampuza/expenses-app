import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/DashboardContent";
import { DashboardSummarySkeleton } from "@/components/DashboardContent";
import { DashboardSummary } from "@/components/DashboardContent";
import { ConnectedUsersListSkeleton } from "@/components/ConnectedUsersList";
import { ConnectedUsersList } from "@/components/ConnectedUsersList";
import { Suspense } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  loader: async ({ context }) => {
    void context.clients.queryClient.ensureQueryData(
      convexQuery(api.connections.getConnectedUsers, {}),
    );
  },
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
