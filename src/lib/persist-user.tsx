import {
  createContext,
  createMemo,
  useContext,
  Loading,
  Show,
  NotReadyError,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createMutation, createQuery, useConvexAuth } from "@/lib/convex";
import { AuthSpinner } from "@/components/LoadingComponent";

export type PersistUserAuthStatus =
  | "checkingAuth"
  | "signedOut"
  | "checkingUser"
  | "persistingUser"
  | "ready"
  | "error";

export type PersistUserAuth = {
  status: PersistUserAuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSignedIn: boolean;
  authState: { userId: Id<"users"> | null };
  error: Error | null;
};

const PersistUserContext = createContext<Accessor<PersistUserAuth>>();

export function usePersistUser() {
  return useContext(PersistUserContext);
}

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error("Failed to persist authenticated user");
}

export function PersistGate(props: ParentProps) {
  const convexAuth = useConvexAuth();
  const persist = createMutation(api.user.persist);
  const user = createQuery(api.user.getCurrentUserForPersistence, () =>
    convexAuth.isAuthenticated() ? {} : "skip",
  );

  let backgroundSyncStarted = false;
  let persistPromise: Promise<{ userId: Id<"users"> }> | undefined;

  const auth = createMemo(async (): Promise<PersistUserAuth> => {
    if (convexAuth.isLoading()) {
      return {
        status: "checkingAuth",
        isLoading: true,
        isAuthenticated: false,
        isSignedIn: false,
        authState: { userId: null },
        error: null,
      };
    }

    if (!convexAuth.isAuthenticated()) {
      backgroundSyncStarted = false;
      persistPromise = undefined;
      return {
        status: "signedOut",
        isLoading: false,
        isAuthenticated: false,
        isSignedIn: false,
        authState: { userId: null },
        error: null,
      };
    }

    try {
      const current = user();
      if (current) {
        if (!backgroundSyncStarted) {
          backgroundSyncStarted = true;
          void persist({}).catch(() => {
            backgroundSyncStarted = false;
          });
        }
        return {
          status: "ready",
          isLoading: false,
          isAuthenticated: true,
          isSignedIn: true,
          authState: { userId: current._id },
          error: null,
        };
      }

      persistPromise ??= persist({});
      const created = await persistPromise;
      return {
        status: "ready",
        isLoading: false,
        isAuthenticated: true,
        isSignedIn: true,
        authState: { userId: created.userId },
        error: null,
      };
    } catch (error) {
      // Pending Convex queries throw NotReadyError; let <Loading> handle that
      // instead of flashing the persist error screen on refresh.
      if (error instanceof NotReadyError) throw error;
      persistPromise = undefined;
      return {
        status: "error",
        isLoading: false,
        isAuthenticated: false,
        isSignedIn: true,
        authState: { userId: null },
        error: toError(error),
      };
    }
  });

  return (
    <PersistUserContext value={auth}>
      <Loading fallback={<AuthSpinner />}>
        <Show
          when={auth().status !== "error" && auth().status !== "checkingAuth"}
          fallback={
            <Show when={auth().status === "error"} fallback={<AuthSpinner />}>
              <div class="relative container mx-auto flex grow flex-col items-center justify-center gap-2 p-12 text-center">
                <p class="text-sm font-medium text-foreground">
                  We couldn't finish setting up your account.
                </p>
                <p class="text-sm text-muted-foreground">
                  Refresh and try signing in again.
                </p>
              </div>
            </Show>
          }
        >
          {props.children}
        </Show>
      </Loading>
    </PersistUserContext>
  );
}
