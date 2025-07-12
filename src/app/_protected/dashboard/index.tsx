import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LoadingComponent } from "~/app/-components/LoadingComponent";
import {
  ConnectionListItem,
  ConnectionsEmpty,
} from "~/app/_protected/dashboard/-ConnectionsList";

export const Route = createFileRoute("/_protected/dashboard/")({
  component: RouteComponent,
  pendingComponent: () => <LoadingComponent />,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.connections.getConnectedUsers, {}),
    );
  },
});

function RouteComponentInner() {
  const connectedUsers = useSuspenseQuery(
    convexQuery(api.connections.getConnectedUsers, {}),
  );

  if (connectedUsers.data.length === 0) {
    return <ConnectionsEmpty />;
  }

  return (
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
  );
}

function RouteComponent() {
  return (
    <main className="flex grow flex-col p-4">
      <div className="mb-4">
        <RouteComponentInner />
      </div>
    </main>
  );
}
