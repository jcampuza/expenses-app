"use client";

import { cn, formatDollars } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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

export function ConnectionsPageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-60" />
      <Skeleton className="h-8 w-80" />
    </div>
  );
}

export function ConnectionsPageHeader({
  connectionId,
}: {
  connectionId: Id<"user_connections">;
}) {
  const expensesQuery = useSuspenseQuery(
    convexQuery(api.expenses.getSharedExpenses, { connectionId }),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">{expensesQuery.data.user.name}</h1>
      <p
        className={cn(
          "mb-4",
          expensesQuery.data.totalBalance > 0 && "text-green-700",
          expensesQuery.data.totalBalance < 0 && "text-destructive",
        )}
      >
        {getBalanceTitle(
          expensesQuery.data.totalBalance,
          expensesQuery.data.user.name,
        )}
      </p>
    </div>
  );
}
