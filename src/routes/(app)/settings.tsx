import { createSignal, For, Loading, Show } from "solid-js";
import {
  LoaderCircle,
  QrCode,
  Ban,
  MoreHorizontal,
  Trash2,
  ArrowLeft,
} from "lucide";
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
import { createMutation, createQuery } from "@/lib/convex";
import { createPendingFn } from "@/lib/pending";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useUser } from "@/lib/clerk";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/icons";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <Show when={user()}>
      {(current) => (
        <div class="container p-4">
          <div class="mb-6">
            <a
              href="/dashboard"
              class="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              <Icon icon={ArrowLeft} class="mr-2 h-4 w-4" />
              Back to Dashboard
            </a>
          </div>

          <h1 class="mb-6 text-2xl font-bold">Account Settings</h1>

          <div class="space-y-6">
            <div class="space-y-2">
              <Label for="name">Name</Label>
              <Input id="name" value={current().fullName ?? ""} disabled />
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={
                  current().emailAddresses[0]?.emailAddress ??
                  current().primaryEmailAddress?.emailAddress ??
                  ""
                }
                disabled
              />
            </div>

            <div class="flex flex-col gap-4">
              <div>
                <GenerateInvitationDialog />
              </div>
              <div>
                <ExpireInvitationsDialog />
              </div>
            </div>

            <div class="mt-8">
              <h2 class="mb-4 text-lg font-semibold">Connected Users</h2>
              <Loading fallback={<ConnectedUsersTableSkeleton />}>
                <ConnectedUsersTable />
              </Loading>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}

type InvitationState =
  | { status: "idle"; data: null; invitationLink: null }
  | { status: "loading"; data: null; invitationLink: null }
  | { status: "ready"; data: string; invitationLink: string };

function ExpireInvitationsDialog() {
  const [open, setOpen] = createSignal(false);
  const { toast } = useToast();
  const expireInvitations = createPendingFn(
    createMutation(api.invitations.expireAllInvitations),
  );

  const handleExpire = async () => {
    const result = await expireInvitations.mutate();
    if (result !== null) {
      setOpen(false);
      toast({
        title: "Invitations Expired",
        description: "All invitations have been expired.",
      });
      return;
    }
    toast({
      title: "Error",
      description: expireInvitations.error() ?? "Unknown error",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <Icon icon={Ban} class="mr-2 h-4 w-4" />
          Expire Invitations
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Expire Invitations</DialogTitle>
        </DialogHeader>
        <DialogDescription class="mb-2">
          Are you sure you want to expire all invitations?
        </DialogDescription>
        <div class="flex gap-2">
          <Button type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => void handleExpire()}
            disabled={expireInvitations.isPending()}
          >
            Expire
            <Show when={expireInvitations.isPending()}>
              <Icon icon={LoaderCircle} class="animate-spin" />
            </Show>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GenerateInvitationDialog() {
  const [state, setState] = createSignal<InvitationState>({
    status: "idle",
    data: null,
    invitationLink: null,
  });
  const { toast } = useToast();
  const getInvitationLink = createPendingFn(
    createMutation(api.invitations.getInvitationLink),
  );

  const generateQRCode = async () => {
    setState({ status: "loading", data: null, invitationLink: null });

    try {
      const dataFromMutation = await getInvitationLink.mutate();

      if (!dataFromMutation) {
        setState({ status: "idle", data: null, invitationLink: null });
        toast({
          title: "Error",
          description:
            "Could not generate an invitation link. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const invitationLink = `${window.location.origin}${dataFromMutation.invitationLink}`;
      const { renderSVG } = await import("uqr");
      const svg = renderSVG(invitationLink);
      setState({
        status: "ready",
        data: svg,
        invitationLink,
      });
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
    <>
      <Button
        onClick={() => void generateQRCode()}
        class="flex"
        disabled={state().status === "loading"}
      >
        <Icon icon={QrCode} class="mr-2 h-4 w-4" />
        Generate Invitation QR Code
        <Show
          when={state().status === "loading" || getInvitationLink.isPending()}
        >
          <Icon icon={LoaderCircle} class="animate-spin" />
        </Show>
      </Button>
      <Dialog
        open={state().status === "ready"}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle class="text-center">
              Your Invitation QR Code
            </DialogTitle>
          </DialogHeader>
          <div class="flex flex-col items-center justify-center p-4">
            <Show when={state().data}>
              {(svg) => (
                <img
                  class="mb-2 w-[100px]"
                  alt="Invitation QR code"
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(svg())}`}
                />
              )}
            </Show>
            <Show when={state().invitationLink}>
              {(link) => (
                <div class="mt-2 space-y-4 text-center">
                  <Button
                    onClick={() => {
                      void navigator.clipboard.writeText(link()).then(() => {
                        toast({
                          title: "Copied to clipboard",
                          description: `Invitation link copied to clipboard: ${link()}`,
                          duration: 3000,
                        });
                      });
                    }}
                  >
                    Copy invitation link to clipboard
                  </Button>
                </div>
              )}
            </Show>
            <p class="mt-4 text-center text-sm text-muted-foreground">
              Scan QR code or send the link to someone to link your accounts
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ConnectedUsersTableSkeleton() {
  return (
    <div class="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Connected Since</TableHead>
            <TableHead class="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell class="h-12">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-4 w-40" />
              <Skeleton class="h-4 w-20" />
              <Skeleton class="ml-auto h-4 w-12" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function ConnectedUsersTable() {
  const connectedUsers = createQuery(
    api.connections.getConnectedUsersForSettings,
  );

  return (
    <Show
      when={(connectedUsers() ?? []).length > 0}
      fallback={
        <div class="rounded-lg border p-6 text-center text-muted-foreground">
          No connected users found. Generate an invitation to connect with
          others.
        </div>
      }
    >
      <div class="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Connected Since</TableHead>
              <TableHead class="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={connectedUsers() ?? []}>
              {(user) => (
                <TableRow>
                  <TableCell class="font-medium">{user.name}</TableCell>
                  <TableCell class="text-muted-foreground">
                    {user.email || "N/A"}
                  </TableCell>
                  <TableCell class="text-muted-foreground">
                    {new Date(user.connectedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <ConnectionActionsDropdown
                      connectionId={user.connectionId}
                      userName={user.name}
                    />
                  </TableCell>
                </TableRow>
              )}
            </For>
          </TableBody>
        </Table>
      </div>
    </Show>
  );
}

function ConnectionActionsDropdown(props: {
  connectionId: Id<"user_connections">;
  userName: string;
}) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);
  const deleteConnection = createPendingFn(
    createMutation(api.connections.deleteConnection),
  );

  const handleDeleteConnection = async () => {
    const result = await deleteConnection.mutate({
      connectionId: props.connectionId,
    });
    if (result !== null) {
      setDeleteDialogOpen(false);
      toast({
        title: "Connection Removed",
        description: `Connection with ${props.userName} has been removed.`,
      });
      return;
    }
    toast({
      title: "Error",
      description: deleteConnection.error() ?? "Unknown error",
      variant: "destructive",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Actions for ${props.userName}`}
          >
            <Icon icon={MoreHorizontal} class="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
            <Icon icon={Trash2} class="mr-2 h-4 w-4" />
            Remove connection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={deleteDialogOpen()} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your connection with{" "}
              {props.userName}? This action cannot be undone and will delete all
              shared expenses between you and {props.userName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConnection()}
              disabled={deleteConnection.isPending()}
              class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Show
                when={deleteConnection.isPending()}
                fallback="Remove Connection"
              >
                <Icon icon={LoaderCircle} class="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </Show>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
