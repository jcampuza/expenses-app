"use client";

import Link from "next/link";
import React from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function InvitationContent({ invitationId }: { invitationId: string }) {
  const acceptInvitationMutation =
    api.invitation.acceptInvitation.useMutation();
  const userFromInvitation = api.invitation.getUserFromInvitation.useQuery({
    token: invitationId,
  });

  console.log(userFromInvitation.error);

  if (userFromInvitation.isLoading) {
    return (
      <InvitationContentWrapper>Loading invitation...</InvitationContentWrapper>
    );
  }

  if (userFromInvitation.error) {
    return (
      <InvitationContentWrapper>
        Error: {userFromInvitation.error.message}
      </InvitationContentWrapper>
    );
  }

  if (acceptInvitationMutation.isSuccess) {
    return (
      <InvitationContentWrapper>
        <div>Invitation accepted!</div>
        <div>
          Back to <Link href="/dashboard">Dashboard</Link>
        </div>
      </InvitationContentWrapper>
    );
  }

  if (userFromInvitation.data) {
    return (
      <InvitationContentWrapper>
        <div className="mb-4">
          {userFromInvitation.data.name} is inviting you to share expenses.
        </div>

        <Button
          onClick={() =>
            acceptInvitationMutation.mutate({ token: invitationId })
          }
          disabled={acceptInvitationMutation.isPending}
        >
          {acceptInvitationMutation.isPending
            ? "Processing..."
            : "Accept Invitation"}
        </Button>
      </InvitationContentWrapper>
    );
  }
}

function InvitationContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-grow flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-3xl font-bold">Invitation</h1>

      {children}
    </div>
  );
}
