import type { Metadata } from "next";
import { Suspense } from "react";

import {
  DashboardHeader,
  DashboardSummary,
  DashboardSummarySkeleton,
} from "./DashboardContent";
import {
  ConnectedUsersList,
  ConnectedUsersListSkeleton,
} from "@/app/(protected)/dashboard/ConnectedUsersList";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function Dashboard() {
  return (
    <main className="flex grow flex-col gap-4 p-4">
      {/* Header */}
      <DashboardHeader />

      {/* Summary cards */}
      <Suspense fallback={<DashboardSummarySkeleton />}>
        <DashboardSummary />
      </Suspense>

      {/* Connections List */}
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
