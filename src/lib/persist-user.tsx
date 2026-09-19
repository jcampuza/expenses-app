import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
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
import {
  derivePersistAuth,
  type PersistUserAuth,
  type PersistUserAuthStatus,
} from "@/lib/persist-user-state";

export type { PersistUserAuth, PersistUserAuthStatus };
export { derivePersistAuth };

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

  const [createdUserId, setCreatedUserId] = createSignal<Id<"users"> | null>(
    null,
  );
  const [persistError, setPersistError] = createSignal<Error | null>(null);

  let backgroundSyncStarted = false;
  let persistPromise: Promise<void> | undefined;

  createEffect(
    () => convexAuth.isAuthenticated(),
    (authenticated) => {
      if (authenticated) return;
      backgroundSyncStarted = false;
      persistPromise = undefined;
      setCreatedUserId(null);
      setPersistError(null);
    },
  );

  createEffect(
    () => {
      if (!convexAuth.isAuthenticated()) return "idle";
      try {
        const current = user();
        if (current) return "exists";
        return createdUserId() ? "created" : "create";
      } catch (error) {
        if (error instanceof NotReadyError) return "idle";
        throw error;
      }
    },
    (mode) => {
      if (mode === "exists") {
        if (backgroundSyncStarted) return;
        backgroundSyncStarted = true;
        void persist({}).catch(() => {
          backgroundSyncStarted = false;
        });
        return;
      }
      if (mode !== "create") return;
      persistPromise ??= persist({})
        .then((result) => {
          setCreatedUserId(result.userId);
        })
        .catch((error) => {
          persistPromise = undefined;
          setPersistError(toError(error));
        });
    },
  );

  const auth = createMemo((): PersistUserAuth => {
    if (!convexAuth.isAuthenticated()) {
      return derivePersistAuth({
        convexAuthLoading: convexAuth.isLoading(),
        convexAuthenticated: false,
        user: null,
        createdUserId: null,
        error: persistError(),
      });
    }

    return derivePersistAuth({
      convexAuthLoading: convexAuth.isLoading(),
      convexAuthenticated: true,
      user: user() ?? null,
      createdUserId: createdUserId(),
      error: persistError(),
    });
  });

  return (
    <PersistUserContext value={auth}>
      <Loading fallback={<AuthSpinner />}>
        <Show
          when={
            auth().status !== "error" &&
            auth().status !== "checkingAuth" &&
            auth().status !== "persistingUser"
          }
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
