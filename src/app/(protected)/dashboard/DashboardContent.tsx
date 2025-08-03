"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ConnectionListItem,
  ConnectionsEmpty,
} from "@/app/(protected)/dashboard/ConnectionsListItem";

export default function DashboardContent() {
  const connectedUsers = useSuspenseQuery(
    convexQuery(api.connections.getConnectedUsers, {}),
  );

  if (!connectedUsers.data || connectedUsers.data.length === 0) {
    return <ConnectionsEmpty />;
  }

  return (
    <main className="flex grow flex-col p-4">
      <div className="mb-4">
        <div className="space-y-4">
          <h2 className="mb-4 text-xl font-semibold">Your Connections</h2>
          <ul className="space-y-3">
            {connectedUsers.data.map((user) => (
              <ConnectionListItem
                key={user.connectionId}
                connectionId={user.connectionId}
                name={user.name}
                totalBalance={user.totalBalance}
              />
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
