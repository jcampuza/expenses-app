import { Loading } from "solid-js";
import { DelayedFallback } from "@/components/DelayedFallback";
import {
  DashboardHeader,
  DashboardSummary,
  DashboardSummarySkeleton,
} from "@/components/DashboardContent";
import {
  ConnectedUsersList,
  ConnectedUsersListSkeleton,
} from "@/components/ConnectedUsersList";

export default function DashboardPage() {
  return (
    <main class="mx-auto flex w-full max-w-3xl grow flex-col gap-4 p-4">
      <DashboardHeader />

      <Loading
        fallback={
          <DelayedFallback>
            <DashboardSummarySkeleton />
          </DelayedFallback>
        }
      >
        <DashboardSummary />
      </Loading>

      <div class="mt-3">
        <div class="space-y-3">
          <Loading
            fallback={
              <DelayedFallback>
                <ConnectedUsersListSkeleton />
              </DelayedFallback>
            }
          >
            <ConnectedUsersList />
          </Loading>
        </div>
      </div>
    </main>
  );
}
