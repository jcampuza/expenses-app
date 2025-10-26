import type { Metadata } from "next";
import { Id } from "@convex/_generated/dataModel";
import {
  ConnectionsPageHeader,
  ConnectionsPageHeaderSkeleton,
} from "./ConnectionPageHeader";
import { Suspense } from "react";
import {
  AddExpenseDialogButton,
  ConnectionExpenseList,
  ConnectionExpenseListSkeleton,
} from "@/app/(protected)/dashboard/connection/[connectionId]/ExpensesTabContent";

export const metadata: Metadata = {
  title: "Connection",
};

interface PageProps {
  params: Promise<{
    connectionId: string;
  }>;
}

export default async function ConnectionPage({ params }: PageProps) {
  const { connectionId: connectionIdString } = await params;
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
