import { cn, formatDollars } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { createQuery } from "@/lib/convex";
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
    <div class="space-y-2">
      <Skeleton class="h-8 w-60" />
      <Skeleton class="h-8 w-80" />
    </div>
  );
}

export function ConnectionsPageHeader(props: {
  connectionId: Id<"user_connections">;
}) {
  const expensesQuery = createQuery(api.expenses.getSharedExpenses, () => ({
    connectionId: props.connectionId,
  }));

  return (
    <div>
      <h1 class="text-2xl font-semibold">{expensesQuery()?.user.name}</h1>
      <p
        class={cn(
          "mb-4",
          (expensesQuery()?.totalBalance ?? 0) > 0 && "text-success",
          (expensesQuery()?.totalBalance ?? 0) < 0 && "text-destructive",
        )}
      >
        {getBalanceTitle(
          expensesQuery()?.totalBalance ?? 0,
          expensesQuery()?.user.name,
        )}
      </p>
    </div>
  );
}
