"use client";

import { useUser } from "@clerk/nextjs";

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
import { useConvexMutation } from "~/hooks/use-convex-mutation";
import { api } from "convex/_generated/api";

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
          <GenerateInvitationDialog />
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

  const { mutate: expireInvitations, isPending } = useConvexMutation(
    api.invitations.expireAllInvitations,
    {
      onSuccess: () => {
        setOpen(false);
        toast({
          title: "Invitations Expired",
          description: "All invitations have been expired.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    },
  );

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

          <Button type="submit" onClick={() => expireInvitations()}>
            Expire
            {isPending ? <Loader2 className="animate-spin" /> : null}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GenerateInvitationDialog() {
  const [state, setState] = useState<State>({
    status: "idle",
    data: null,
    invitationLink: null,
  });

  const { mutate: getInvitationLink, isPending } = useConvexMutation(
    api.invitations.getInvitationLink,
  );

  const generateQRCode = async () => {
    setState({ status: "loading", data: null, invitationLink: null });

    try {
      const dataFromMutation = await getInvitationLink();

      if (dataFromMutation) {
        const invitationLink = dataFromMutation.invitationLink;
        const { renderSVG } = await import("uqr");
        const svg = renderSVG(`${window.location.host}${invitationLink}`);
        setState({
          status: "ready",
          data: svg,
          invitationLink: `${window.location.host}${invitationLink}`,
        });
      } else {
        setState({ status: "idle", data: null, invitationLink: null });
      }
    } catch (error) {
      setState({ status: "idle", data: null, invitationLink: null });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
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
          {state.status === "loading" || isPending ? (
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
                        description: (
                          <>
                            Invitation link copied to clipboard:{" "}
                            {state.invitationLink}
                          </>
                        ),
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
