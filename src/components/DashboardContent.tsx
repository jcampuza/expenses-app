import { api } from "@convex/_generated/api";
import { createQuery } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Users } from "lucide";
import { formatDollars, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/icons";

export function DashboardSummary() {
  const connectedUsers = createQuery(api.connections.getConnectedUsers);

  return (
    <div class="grid grid-cols-2 gap-3">
      <Card>
        <CardHeader class="p-3">
          <CardTitle class="flex items-center gap-2 text-sm font-medium">
            <Icon icon={Users} class="h-4 w-4" /> Connections
          </CardTitle>
        </CardHeader>
        <CardContent class="px-3 pb-3 text-2xl font-semibold">
          {connectedUsers()?.length ?? 0}
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="p-3">
          <CardTitle class="text-sm font-medium">Net Balance</CardTitle>
        </CardHeader>
        <CardContent class="px-3 pb-3 text-2xl font-semibold">
          {formatDollars(
            (connectedUsers() ?? []).reduce(
              (sum, u) => sum + u.totalBalance,
              0,
            ),
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardSummarySkeleton() {
  return (
    <div class="grid grid-cols-2 gap-3">
      <Skeleton class="h-20 w-full border" />
      <Skeleton class="h-20 w-full border" />
    </div>
  );
}

export function DashboardHeader() {
  return (
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-semibold">Dashboard</h1>
        <p class="text-sm text-muted-foreground">
          Overview of your connections and recent activity
        </p>
      </div>
      <a
        href="/settings"
        class={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2")}
      >
        <Icon icon={Plus} class="h-4 w-4" /> Invite a friend
      </a>
    </div>
  );
}
