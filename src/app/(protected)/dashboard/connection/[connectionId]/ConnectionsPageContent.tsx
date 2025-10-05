"use client";

import { Suspense } from "react";
import { cn, formatDollars } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/Skeletons";
import {
  ExpensesTabContent,
  AddExpenseDialogButton,
} from "./ExpensesTabContent";

const getBalanceTitle = (totalBalance: number, userName?: string | null) => {
  if (totalBalance > 0) {
    const theirName = userName ?? "They";
    return `${theirName} owes ${formatDollars(Math.abs(totalBalance))}`;
  }
  if (totalBalance < 0) {
    return `You owe ${formatDollars(Math.abs(totalBalance))}`;
  }
  return "All debts settled";
};

function ExpensesTabSkeleton() {
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

export function ConnectionsPageContainer({
  connectionId,
}: {
  connectionId: Id<"user_connections">;
}) {
  const expensesQuery = useSuspenseQuery(
    convexQuery(api.expenses.getSharedExpenses, { connectionId }),
  );

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {expensesQuery.data.user.name}
          </h1>
          <p
            className={cn(
              "mb-4",
              expensesQuery.data.totalBalance > 0 &&
                "text-green-600 dark:text-green-400",
              expensesQuery.data.totalBalance < 0 && "text-destructive",
            )}
          >
            {getBalanceTitle(
              expensesQuery.data.totalBalance,
              expensesQuery.data.user.name,
            )}
          </p>
        </div>
        <div className="hidden md:block">
          <AddExpenseDialogButton
            connectionId={connectionId}
            variant="desktop"
          />
        </div>
      </div>

      <div className="mt-2">
        <Suspense fallback={<ExpensesTabSkeleton />}>
          <ExpensesTabContent connectionId={connectionId} />
        </Suspense>
      </div>
    </div>
  );
}
