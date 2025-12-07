import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { Id } from "@convex/_generated/dataModel";

import {
  ConnectionsPageHeader,
  ConnectionsPageHeaderSkeleton,
} from "@/features/connection/ConnectionPageHeader";
import {
  AddExpenseDialogButton,
  ConnectionExpenseList,
  ConnectionExpenseListSkeleton,
} from "@/features/connection/ExpensesTabContent";

export const Route = createFileRoute(
  "/_authenticated/dashboard/connection/$connectionId",
)({
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
