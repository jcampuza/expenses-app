"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { api } from "convex/_generated/api";
import { useConvexMutation } from "~/hooks/use-convex-mutation";
import { useQuery } from "convex/react";
import { ErrorBoundary } from "~/app/components/ErrorBoundary";
import { AppLink } from "~/components/ui/app-link";

function InvitationContentInner({ invitationId }: { invitationId: string }) {
  const {
    mutate: acceptInvitation,
    isPending,
    error,
  } = useConvexMutation(api.invitations.acceptInvitation);

  const invitation = useQuery(api.invitations.getInvitation, {
    token: invitationId,
  });

  if (!invitation) {
    return <div>Loading invitation...</div>;
  }

  if (invitation.invitation.isUsed) {
    return (
      <div>
        Invitation accepted. Please go to{" "}
        <AppLink href="/dashboard">Dashboard</AppLink>.
      </div>
    );
  }

  if (error) {
    return (
      <div>There was an issue accepting invitation. Please try again.</div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        {invitation.inviter.name} is inviting you to share expenses.
      </div>

      <Button
        onClick={() => acceptInvitation({ token: invitationId })}
        disabled={isPending}
      >
        {isPending ? "Processing..." : "Accept Invitation"}
      </Button>
    </div>
  );
}

export function InvitationContent({ invitationId }: { invitationId: string }) {
  return (
    <div className="flex flex-grow flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-3xl font-bold">Invitation</h1>

      <ErrorBoundary
        renderFallback={(error) => <div>Error: {error.message}</div>}
      >
        <InvitationContentInner invitationId={invitationId} />
      </ErrorBoundary>
    </div>
  );
}
