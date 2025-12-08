import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { Id } from "@convex/_generated/dataModel";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";

import {
  ConnectionsPageHeader,
  ConnectionsPageHeaderSkeleton,
} from "@/components/ConnectionPageHeader";
import {
  AddExpenseDialogButton,
  ConnectionExpenseList,
  ConnectionExpenseListSkeleton,
} from "@/components/ExpensesTabContent";

export const Route = createFileRoute(
  "/_authenticated/dashboard/connection/$connectionId",
)({
  loader: async ({ context, params }) => {
    const connectionId = params.connectionId as Id<"user_connections">;

    // Purposely not awaiting these queries so that if the route is loaded
    // the route will still suspend and showing skeletons
    void context.clients.queryClient.ensureQueryData(
      convexQuery(api.expenses.getSharedExpenses, { connectionId }),
    );

    void context.clients.queryClient.ensureQueryData(
      convexQuery(api.user.getCurrentUserAuthenticated, {}),
    );
  },
  component: ConnectionPage,
});

function ConnectionPage() {
  const { connectionId: connectionIdString } = Route.useParams();
  const connectionId = connectionIdString as Id<"user_connections">;

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between">
        <Suspense fallback={<ConnectionsPageHeaderSkeleton />}>
          <ConnectionsPageHeader connectionId={connectionId} />
        </Suspense>

        <div className="hidden md:block">
          <AddExpenseDialogButton
            connectionId={connectionId}
            variant="desktop"
          />
        </div>
      </div>

      <div className="mt-2">
        <Suspense fallback={<ConnectionExpenseListSkeleton />}>
          <ConnectionExpenseList connectionId={connectionId} />
        </Suspense>
      </div>
    </div>
  );
}
