import { Loading } from "solid-js";
import { useParams } from "@solidjs/router";
import { Id } from "@convex/_generated/dataModel";
import {
  ConnectionsPageHeader,
  ConnectionsPageHeaderSkeleton,
} from "@/components/ConnectionPageHeader";
import {
  AddExpenseDialogButton,
  ConnectionExpenseList,
  ConnectionExpenseListSkeleton,
} from "@/components/ExpensesTabContent";

export default function ConnectionPage() {
  const params = useParams();
  const connectionId = () => params.connectionId as Id<"user_connections">;

  return (
    <div class="flex-1 p-4">
      <div class="flex items-center justify-between">
        <Loading fallback={<ConnectionsPageHeaderSkeleton />}>
          <ConnectionsPageHeader connectionId={connectionId()} />
        </Loading>

        <div class="hidden md:block">
          <AddExpenseDialogButton
            connectionId={connectionId()}
            variant="desktop"
          />
        </div>
      </div>

      <div class="mt-2">
        <Loading fallback={<ConnectionExpenseListSkeleton />}>
          <ConnectionExpenseList connectionId={connectionId()} />
        </Loading>
      </div>
    </div>
  );
}
