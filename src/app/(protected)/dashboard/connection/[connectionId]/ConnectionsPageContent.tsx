"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ConnectionActivityFeed } from "./ConnectionActivityFeed";

type TabValue = "expenses" | "activity";

function useSelectedTab(): {
  value: TabValue;
  setValue: (next: string) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const value: TabValue = tabParam === "activity" ? "activity" : "expenses";

  const setValue = (next: string) => {
    const coerced: TabValue = next === "activity" ? "activity" : "expenses";
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", coerced);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return { value, setValue };
}

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

function ActivityTabSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="mt-2 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
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
  const { value: activeTab, setValue: handleTabChange } = useSelectedTab();

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
              expensesQuery.data.totalBalance < 0 &&
                "text-red-600 dark:text-red-400",
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-2">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Suspense fallback={<ExpensesTabSkeleton />}>
            <ExpensesTabContent connectionId={connectionId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity">
          <Suspense fallback={<ActivityTabSkeleton />}>
            <ConnectionActivityFeed connectionId={connectionId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
