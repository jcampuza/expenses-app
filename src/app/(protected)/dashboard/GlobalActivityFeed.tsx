"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { DismissibleAlert } from "@/components/DismissibleAlert";
import { Skeleton } from "@/components/ui/skeleton";

type ConnectedUserSummary = {
  connectionId: Id<"user_connections">;
  userId: Id<"users">;
  name: string;
  totalBalance: number;
};

function renderAction(log: Doc<"expense_audit_logs">) {
  switch (log.action) {
    case "create":
      return "created an expense";
    case "update":
      return log.changes
        .map((c) => `Updated ${c.key} to ${c.after}`)
        .join(". ");
    case "delete":
      return "deleted an expense";
    default:
      return log.action;
  }
}

export function DashboardActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={idx}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function GlobalActivityFeed({
  connectedUsers,
}: {
  connectedUsers: ConnectedUserSummary[];
}) {
  const { data: me } = useSuspenseQuery(
    convexQuery(api.user.getCurrentUserAuthenticated, {}),
  );
  const activity = useSuspenseQuery(
    convexQuery(api.audit.getMyActivityFeed, {}),
  );

  const nameByUserId = new Map<Id<"users">, string>(
    connectedUsers.map((u) => [u.userId, u.name]),
  );

  return (
    <div className="space-y-3">
      <DismissibleAlert
        id="dashboard-activity-beta"
        title="Beta"
        description="The dashboard activity feed is new and still in beta. It may change as we continue to improve it."
        variant="warning"
      />
      {activity.data.length === 0 ? (
        <div className="text-sm text-muted-foreground">No recent activity.</div>
      ) : (
        activity.data
          .slice()
          .sort((a, b) => b._creationTime - a._creationTime)
          .map((log) => {
            const actorId = log.actorUserId as Id<"users">;
            const isMe = me && me._id === actorId;
            const actorLabel = isMe
              ? "You"
              : (nameByUserId.get(actorId) ?? "Someone");

            return (
              <Card key={log._id}>
                <CardContent className="p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium capitalize">{actorLabel}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log._creationTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-1">{renderAction(log)}</div>
                </CardContent>
              </Card>
            );
          })
      )}
    </div>
  );
}
