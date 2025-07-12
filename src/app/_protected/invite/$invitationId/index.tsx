import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { InvitationContent } from "~/app/_protected/invite/$invitationId/-InvitationContent";
import { AppLink } from "~/components/ui/app-link";

export const Route = createFileRoute("/_protected/invite/$invitationId/")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.invitations.getInvitation, {
        token: params.invitationId,
      }),
    );
  },
  errorComponent: ({ error }) => {
    return (
      <div className="mt-12 flex grow flex-col items-center p-4 text-center">
        <h1 className="mb-4 text-2xl font-bold">Invitation Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The invitation you&apos;re looking for doesn&apos;t exist or has
          expired.
        </p>

        <AppLink to="/dashboard">Go to dashboard</AppLink>

        {import.meta.env.MODE === "development" && (
          <div className="text-muted-foreground mb-4 max-w-full text-left">
            <pre className="overflow-auto bg-black text-white">
              {error.message}
            </pre>
          </div>
        )}
      </div>
    );
  },
});

function RouteComponent() {
  const { invitationId } = Route.useParams();

  if (!invitationId) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <main>
      <InvitationContent invitationId={invitationId} />
    </main>
  );
}
