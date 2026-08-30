import { Loading, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { LoaderCircle } from "lucide";
import { api } from "@convex/_generated/api";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { SignedIn, SignedOut, SignInButton } from "@/lib/clerk";
import { createMutation, createQuery } from "@/lib/convex";
import { createPendingFn } from "@/lib/pending";

export default function InvitePage() {
  const params = useParams();

  return (
    <PublicLayout>
      <main class="mx-auto flex w-full max-w-lg grow flex-col items-center justify-center p-6 text-center">
        <h1 class="mb-4 text-3xl font-bold">Invitation</h1>
        <SignedIn>
          <InvitationContent token={() => params.token ?? ""} />
        </SignedIn>
        <SignedOut>
          <div class="space-y-4">
            <p class="text-muted-foreground">
              Sign in to accept this invitation and start sharing expenses.
            </p>
            <SignInButton mode="modal">
              <Button size="lg">Sign in to continue</Button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
    </PublicLayout>
  );
}

function InvitationContent(props: { token: () => string }) {
  const navigate = useNavigate();
  const invitation = createQuery(api.invitations.getInvitation, () => ({
    token: props.token(),
  }));
  const accept = createPendingFn(
    createMutation(api.invitations.acceptInvitation),
  );

  const handleAccept = async () => {
    const result = await accept.mutate({ token: props.token() });
    if (result !== null) {
      navigate("/dashboard");
    }
  };

  return (
    <Loading
      fallback={
        <Icon icon={LoaderCircle} class="h-8 w-8 animate-spin text-primary" />
      }
    >
      <Show
        when={invitation()}
        fallback={
          <div class="space-y-4">
            <p class="text-muted-foreground">
              This invitation doesn't exist, has expired, or can't be accepted
              with this account.
            </p>
            <a href="/dashboard">
              <Button>Go to dashboard</Button>
            </a>
          </div>
        }
      >
        {(data) => (
          <Show
            when={!data().invitation.isUsed}
            fallback={
              <div class="space-y-4">
                <p class="text-muted-foreground">
                  This invitation was already accepted.
                </p>
                <a href="/dashboard">
                  <Button>Go to dashboard</Button>
                </a>
              </div>
            }
          >
            <div class="space-y-4">
              <p>
                <span class="font-medium">{data().inviter.name}</span> is
                inviting you to share expenses.
              </p>
              <Show when={accept.error()}>
                <p class="text-sm text-destructive">{accept.error()}</p>
              </Show>
              <Button
                onClick={() => void handleAccept()}
                disabled={accept.isPending()}
              >
                {accept.isPending() ? "Processing..." : "Accept Invitation"}
              </Button>
            </div>
          </Show>
        )}
      </Show>
    </Loading>
  );
}
