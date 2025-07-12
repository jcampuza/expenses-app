import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Id } from "node_modules/convex/dist/esm-types/values/value";
import { LoadingComponent } from "~/app/-components/LoadingComponent";
import { ConnectionsPageContainer } from "~/app/_protected/dashboard/connection/$connectionId/-ConnectionsPageContent";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute(
  "/_protected/dashboard/connection/$connectionId/",
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.expenses.getSharedExpenses, {
          connectionId: params.connectionId as Id<"user_connections">,
        }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.user.getCurrentUser, {}),
      ),
    ]);
  },
  pendingComponent: () => <LoadingComponent />,
  errorComponent: ({ error, info }) => (
    <ErrorComponent error={error} info={info} />
  ),
});

function ErrorComponent({
  error,
  info,
}: {
  error: Error;
  info: { componentStack: string } | undefined;
}) {
  const navigate = useNavigate();
  return (
    <div>
      <div className="mb-4">
        Error: {error.message} {info?.componentStack ?? ""}
      </div>
      <Button onClick={() => navigate({ to: "/dashboard" })}>
        Go to dashboard
      </Button>
    </div>
  );
}

function RouteComponent() {
  const { connectionId } = Route.useParams();

  return (
    <ConnectionsPageContainer
      connectionId={connectionId as Id<"user_connections">}
    />
  );
}
