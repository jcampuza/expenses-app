"use client";

import { useUser } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { Loader2, QrCode, Delete } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast, useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

type State =
  | { status: "idle"; data: null; invitationLink: null }
  | { status: "loading"; data: null; invitationLink: null }
  | { status: "ready"; data: string; invitationLink: string };

export default function SettingsForm() {
  const user = useUser();

  if (!user.user) {
    return null;
  }

  const userData = {
    name: user.user?.fullName ?? "",
    email: user.user?.emailAddresses[0]?.emailAddress ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={userData.name} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={userData.email} disabled />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <GenerateInvitationDialog user={user.user} />
        </div>

        <div>
          <ExpireInvitationsDialog />
        </div>
      </div>
    </div>
  );
}

function ExpireInvitationsDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const expireInvitations = api.invitation.expireAllInvitations.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast({
        title: "Invitations Expired",
        description: "All invitations have been expired.",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <DialogTrigger asChild>
        <Button>
          <Delete className="mr-2 h-4 w-4" />
          Expire Invitations
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Expire Invitations</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mb-2">
          Are you sure you want to expire all invitations?
        </DialogDescription>
        <div className="flex gap-2">
          <Button type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button type="submit" onClick={() => expireInvitations.mutateAsync()}>
            Expire
            {expireInvitations.isPending ? (
              <Loader2 className="animate-spin" />
            ) : null}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GenerateInvitationDialog({ user }: { user: UserResource }) {
  const [state, setState] = useState<State>({
    status: "idle",
    data: null,
    invitationLink: null,
  });

  const { mutateAsync } = api.invitation.getInviationLink.useMutation();

  const generateQRCode = async () => {
    setState({ status: "loading", data: null, invitationLink: null });

    try {
      const dataFromMutation = await mutateAsync({
        inviterUserId: user.id,
      });
      const invitationLink = dataFromMutation.invitationLink;
      const { renderSVG } = await import("uqr");
      const svg = renderSVG(`${invitationLink}`);
      setState({
        status: "ready",
        data: svg,
        invitationLink: `${window.location.hostname}${invitationLink}`,
      });
    } catch {
      setState({ status: "idle", data: null, invitationLink: null });
    }
  };

  const close = () => {
    setState({ status: "idle", data: null, invitationLink: null });
  };

  return (
    <Dialog
      open={state.status === "ready"}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button onClick={() => generateQRCode()} className="flex">
          <QrCode className="mr-2 h-4 w-4" />
          Generate Account QR Code
          {state.status === "loading" ? (
            <Loader2 className="animate-spin" />
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Account QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          {state.data ? (
            <div
              className="mb-2"
              style={{ width: 100 }}
              dangerouslySetInnerHTML={{
                __html: state.data,
              }}
            />
          ) : null}
          {/* Display the invitation link below the QR code */}
          {state.invitationLink && (
            <div className="mt-2 space-y-4 text-center">
              <Button
                onClick={() => {
                  navigator.clipboard
                    .writeText(state.invitationLink)
                    .then(() => {
                      toast({
                        title: "Copied to clipboard",
                        description: "Invitation link copied to clipboard",
                        duration: 3000,
                      });
                    });
                }}
              >
                Copy invitation link to clipboard
              </Button>
            </div>
          )}
          <p className="mt-4 text-center text-sm text-gray-500">
            Scan QR code or send the link to someone to link your accounts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
