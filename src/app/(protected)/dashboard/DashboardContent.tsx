"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { formatDollars } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSummary() {
  const connectedUsers = useSuspenseQuery(
    convexQuery(api.connections.getConnectedUsers, {}),
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" /> Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 text-2xl font-semibold">
          {connectedUsers.data.length}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 text-2xl font-semibold">
          {formatDollars(
            connectedUsers.data.reduce((sum, u) => sum + u.totalBalance, 0),
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardSummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-20 w-full border" />
      <Skeleton className="h-20 w-full border" />
    </div>
  );
}

export function DashboardHeader() {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your connections and recent activity
        </p>
      </div>
      <Link href="/settings">
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Invite a friend
        </Button>
      </Link>
    </div>
  );
}
