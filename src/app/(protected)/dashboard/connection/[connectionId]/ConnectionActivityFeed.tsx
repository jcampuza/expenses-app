"use client";

import { Doc, Id } from "@convex/_generated/dataModel";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { DismissibleAlert } from "@/components/DismissibleAlert";

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

export function ConnectionActivityFeed({
  connectionId,
}: {
  connectionId: Id<"user_connections">;
}) {
  const activity = useSuspenseQuery(
    convexQuery(api.audit.getActivityForConnection, { connectionId }),
  );

  return (
    <div className="space-y-3">
      <DismissibleAlert
        id="activity-feed-beta"
        title="Beta"
        description="This page is new and still in beta. It may change as we continue to improve it."
        variant="warning"
      />

      {activity.data.length === 0 ? (
        <div className="text-sm text-muted-foreground">No recent activity.</div>
      ) : (
        activity.data.map((log) => (
          <div key={log._id} className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium capitalize">
                {log.actor?.name ?? "Someone"}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(log._creationTime).toLocaleString()}
              </div>
            </div>

            {renderAction(log)}
          </div>
        ))
      )}
    </div>
  );
}
