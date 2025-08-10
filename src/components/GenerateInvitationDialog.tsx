"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useConvexMutation } from "@/hooks/use-convex-mutation";
import { api } from "@convex/_generated/api";
import { Loader2, QrCode } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type State =
  | { status: "idle"; data: null; invitationLink: null }
  | { status: "loading"; data: null; invitationLink: null }
  | { status: "ready"; data: string; invitationLink: string };

export type GenerateInvitationDialogProps = {
  triggerLabel?: string;
  triggerIcon?: ReactNode;
  buttonClassName?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  autoOpenOnMount?: boolean;
};

export function GenerateInvitationDialog({
  triggerLabel = "Generate Invitation QR Code",
  triggerIcon = <QrCode className="mr-2 h-4 w-4" />,
  buttonClassName,
  buttonSize = "sm",
  buttonVariant = "default",
  autoOpenOnMount = false,
}: GenerateInvitationDialogProps) {
  const [state, setState] = useState<State>({
    status: "idle",
    data: null,
    invitationLink: null,
  });
  const { toast } = useToast();
  const hasAutoOpenedRef = useRef(false);

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

  useEffect(() => {
    if (autoOpenOnMount && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      generateQRCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenOnMount]);

  return (
    <Dialog
      open={state.status === "ready"}
      onOpenChange={(open: boolean) => {
        if (!open) {
          close();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          onClick={() => generateQRCode()}
          className={buttonClassName}
          size={buttonSize}
          variant={buttonVariant}
        >
          {triggerIcon}
          {triggerLabel}
          {state.status === "loading" || isPending ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Your Invitation QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          {state.data ? (
            <div
              className="mb-2"
              style={{ width: 100 }}
              dangerouslySetInnerHTML={{ __html: state.data }}
            />
          ) : null}
          {state.invitationLink && (
            <div className="mt-2 space-y-4 text-center">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(state.invitationLink!).then(() => {
                    toast({
                      title: "Copied to clipboard",
                      description: `Invitation link copied to clipboard: ${state.invitationLink}`,
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