import { convexQuery } from "@convex-dev/react-query";
import { api } from "@convex/_generated/api";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SignInButton } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { useConvexMutation } from "@/hooks/use-convex-mutation";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const { auth } = Route.useRouteContext();

  return (
    <PublicLayout>
      <main className="mx-auto flex w-full max-w-lg grow flex-col items-center justify-center p-6 text-center">
        <h1 className="mb-4 text-3xl font-bold">Invitation</h1>
        {auth.isSignedIn ? (
          <InvitationContent token={token} />
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Sign in to accept this invitation and start sharing expenses.
            </p>
            <SignInButton mode="modal">
              <Button size="lg">Sign in to continue</Button>
            </SignInButton>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}

function InvitationContent({ token }: { token: string }) {
  const navigate = useNavigate();
  const invitationQuery = useQuery(
    convexQuery(api.invitations.getInvitation, { token }),
  );
  const {
    mutate: acceptInvitation,
    isPending,
    error,
  } = useConvexMutation(api.invitations.acceptInvitation, {
    onSuccess: () => {
      void navigate({ to: "/dashboard" });
    },
  });

  if (invitationQuery.isPending) {
    return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
  }

  if (invitationQuery.isError || !invitationQuery.data) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          This invitation doesn&apos;t exist, has expired, or can&apos;t be
          accepted with this account.
        </p>
        <Button nativeButton={false} render={<Link to="/dashboard" />}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  const { invitation, inviter } = invitationQuery.data;

  if (invitation.isUsed) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          This invitation was already accepted.
        </p>
        <Button nativeButton={false} render={<Link to="/dashboard" />}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p>
        <span className="font-medium">{inviter.name}</span> is inviting you to
        share expenses.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button onClick={() => acceptInvitation({ token })} disabled={isPending}>
        {isPending ? "Processing..." : "Accept Invitation"}
      </Button>
    </div>
  );
}
