"use client";

import { useUser } from "@clerk/nextjs";
import {
  Loader2,
  QrCode,
  Delete,
  MoreHorizontal,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useConvexMutation } from "@/hooks/use-convex-mutation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AppLink } from "@/components/ui/app-link";
import { GenerateInvitationDialog as GenerateInvitationDialogComponent } from "@/components/GenerateInvitationDialog";
import { useSearchParams } from "next/navigation";


export function SettingsPageContent() {
  const user = useUser();
  const searchParams = useSearchParams();

  if (!user.user) {
    return null;
  }

  const userData = {
    name: user.user?.fullName ?? "",
    email: user.user?.emailAddresses[0]?.emailAddress ?? "",
  };

  const autoOpenInvite = searchParams.get("openInvite") === "true";

  return (
    <div className="container p-4">
      <div className="mb-6">
        <Button asChild variant="ghost" className="hover:bg-transparent">
          <AppLink
            href="/dashboard"
            className="text-primary inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </AppLink>
        </Button>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>

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
            {/* Reusable Invite dialog with optional auto-open via URL */}
            <AutoOpenInvite generateOnMount={autoOpenInvite} />
          </div>

          <div>
            <ExpireInvitationsDialog />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Connected Users</h2>
          <ConnectedUsersTable />
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
      onError: (error: string) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    },
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => setOpen(isOpen)}>
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

function AutoOpenInvite({ generateOnMount }: { generateOnMount: boolean }) {
  return (
    <div>
      <GenerateInvitationDialogComponent
        triggerLabel="Generate Invitation QR Code"
        triggerIcon={<QrCode className="mr-2 h-4 w-4" />}
        buttonClassName="flex"
        buttonSize="default"
        autoOpenOnMount={generateOnMount}
      />
    </div>
  );
}

function ConnectedUsersTable() {
  const { data: connectedUsers, isPending } = useSuspenseQuery(
    convexQuery(api.connections.getConnectedUsersForSettings, {}),
  );

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!connectedUsers || connectedUsers.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border p-6 text-center">
        No connected users found. Generate an invitation to connect with others.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Connected Since</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connectedUsers.map((user) => (
            <TableRow key={user.connectionId}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {user.email || "N/A"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.connectedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <ConnectionActionsDropdown
                  connectionId={user.connectionId}
                  userName={user.name}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ConnectionActionsDropdown({
  connectionId,
  userName,
}: {
  connectionId: Id<"user_connections">;
  userName: string;
}) {
  const { toast } = useToast();

  const { mutate: deleteConnection, isPending } = useConvexMutation(
    api.connections.deleteConnection,
    {
      onSuccess: () => {
        toast({
          title: "Connection Removed",
          description: `Connection with ${userName} has been removed.`,
        });
      },
      onError: (error: string) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    },
  );

  const handleDeleteConnection = () => {
    deleteConnection({ connectionId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove connection
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Connection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove your connection with {userName}?
                This action cannot be undone and will delete all shared expenses
                between you and {userName}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConnection}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove Connection"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
