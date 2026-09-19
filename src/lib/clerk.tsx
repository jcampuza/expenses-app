import {
  createContext,
  createEffect,
  createSignal,
  onSettled,
  Show,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { Clerk } from "@clerk/clerk-js";
import type {
  SignedInSessionResource,
  UserResource,
} from "@clerk/shared/types";
import { useConvex, useConvexAuth, useConvexAuthStatus } from "@/lib/convex";

type ClerkState = {
  loaded: boolean;
  user: UserResource | null;
  session: SignedInSessionResource | null;
  isSignedIn: boolean;
};

const ClerkContext = createContext<{
  clerk: Clerk;
  state: Accessor<ClerkState>;
}>();

export function ClerkProvider(props: ParentProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
  const clerk = new Clerk(publishableKey);
  const [state, setState] = createSignal<ClerkState>({
    loaded: false,
    user: null,
    session: null,
    isSignedIn: false,
  });

  const sync = () => {
    setState({
      loaded: clerk.loaded,
      user: clerk.user ?? null,
      session: clerk.session ?? null,
      isSignedIn: Boolean(clerk.session),
    });
  };

  onSettled(() => {
    if (!publishableKey) {
      setState({
        loaded: true,
        user: null,
        session: null,
        isSignedIn: false,
      });
      return;
    }

    let unsubscribe: (() => void) | undefined;
    void clerk.load().then(() => {
      unsubscribe = clerk.addListener(() => {
        sync();
      });
      sync();
    });

    return () => {
      unsubscribe?.();
    };
  });

  return (
    <ClerkContext
      value={{
        clerk,
        state,
      }}
    >
      <Show
        when={state().loaded}
        fallback={
          <div class="relative container mx-auto flex grow flex-col items-center p-12">
            <div class="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        {props.children}
      </Show>
    </ClerkContext>
  );
}

export function useClerk() {
  return useContext(ClerkContext).clerk;
}

export function useClerkState() {
  return useContext(ClerkContext).state;
}

export function useUser() {
  const state = useClerkState();
  return {
    user: () => state().user,
    isSignedIn: () => state().isSignedIn,
  };
}

export function useAuth() {
  const clerk = useClerk();
  const state = useClerkState();
  return {
    isSignedIn: () => state().isSignedIn,
    userId: () => state().user?.id ?? null,
    getToken: async (options?: { template?: string }) => {
      return (await clerk.session?.getToken(options)) ?? null;
    },
    signOut: () => clerk.signOut(),
  };
}

export function ConvexClerkAuth(props: ParentProps) {
  const clerk = useClerk();
  const clerkState = useClerkState();
  const client = useConvex();
  const convexAuth = useConvexAuth();
  const { setAuthenticated } = useConvexAuthStatus();

  createEffect(
    () => clerkState().session?.id ?? null,
    (sessionId) => {
      if (!sessionId) {
        client.setAuth(
          async () => null,
          () => {
            setAuthenticated(false);
          },
        );
        setAuthenticated(false);
        return;
      }

      let cancelled = false;
      // Stay authenticated while Convex reconfirms a new session/token.
      // Only the first confirmation should read as loading.
      if (!convexAuth.isAuthenticated()) {
        setAuthenticated(null);
      }

      client.setAuth(
        async ({ forceRefreshToken }) => {
          return (
            (await clerk.session?.getToken({
              template: "convex",
              skipCache: forceRefreshToken,
            })) ?? null
          );
        },
        (isAuthenticated) => {
          if (!cancelled) setAuthenticated(isAuthenticated);
        },
      );

      return () => {
        cancelled = true;
      };
    },
  );

  return <>{props.children}</>;
}

export function SignInButton(
  props: ParentProps<{
    mode?: "modal" | "redirect";
    class?: string;
  }>,
) {
  const clerk = useClerk();
  return (
    <span
      class={props.class ?? "contents"}
      onClick={() => {
        if (props.mode === "redirect") {
          void clerk.redirectToSignIn();
          return;
        }
        clerk.openSignIn();
      }}
    >
      {props.children}
    </span>
  );
}

export function SignedIn(props: ParentProps) {
  const state = useClerkState();
  return <Show when={state().isSignedIn}>{props.children}</Show>;
}

export function SignedOut(props: ParentProps) {
  const state = useClerkState();
  return <Show when={!state().isSignedIn}>{props.children}</Show>;
}
