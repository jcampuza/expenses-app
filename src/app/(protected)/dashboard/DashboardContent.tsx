"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { ConnectionsEmpty, ConnectedUsersList } from "./ConnectedUsersList";
import Link from "next/link";
import { formatDollars } from "@/lib/utils";

export default function DashboardContent() {
  const connectedUsers = useSuspenseQuery(
    convexQuery(api.connections.getConnectedUsers, {}),
  );

  if (!connectedUsers.data || connectedUsers.data.length === 0) {
    return <ConnectionsEmpty />;
  }

  return (
    <main className="flex grow flex-col gap-4 p-4">
      {/* Header */}
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

      {/* Summary cards */}
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

      {/* Connections List */}
      <div className="mt-3">
        <div className="space-y-3">
          <ConnectedUsersList users={connectedUsers.data} />
        </div>
      </div>
    </main>
  );
}
