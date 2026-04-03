import { useConvexAuth } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";

export type AuthState = {
  userId: Id<"users"> | null;
};

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
  authState: AuthState;
  error: Error | null;
};

function toError(error: unknown) {
  return error instanceof Error
    ? error
    : new Error("Failed to persist authenticated user");
}

export function usePersistUserEffect() {
  const { isLoading: authIsLoading, isAuthenticated } = useConvexAuth();
  const bootstrapPersistStartedRef = useRef(false);
  const backgroundSyncStartedRef = useRef(false);
  const [bootstrapPersistError, setBootstrapPersistError] =
    useState<Error | null>(null);

  const { data: user, isLoading: userQueryIsLoading } = useQuery(
    convexQuery(
      api.user.getCurrentUserForPersistence,
      isAuthenticated ? {} : "skip",
    ),
  );

  const { mutateAsync: persistUser } = useMutation({
    mutationFn: useConvexMutation(api.user.persist),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      bootstrapPersistStartedRef.current = false;
      backgroundSyncStartedRef.current = false;
      return;
    }

    if (userQueryIsLoading) {
      return;
    }

    if (user) {
      if (
        bootstrapPersistStartedRef.current ||
        backgroundSyncStartedRef.current
      ) {
        return;
      }

      backgroundSyncStartedRef.current = true;
      void persistUser({}).catch(() => {
        backgroundSyncStartedRef.current = false;
      });
      return;
    }

    if (bootstrapPersistError) {
      return;
    }

    if (bootstrapPersistStartedRef.current) {
      return;
    }

    bootstrapPersistStartedRef.current = true;
    void persistUser({}).catch((error) => {
      bootstrapPersistStartedRef.current = false;
      setBootstrapPersistError(toError(error));
    });
  }, [
    bootstrapPersistError,
    isAuthenticated,
    persistUser,
    user,
    userQueryIsLoading,
  ]);

  let status: PersistUserAuthStatus;

  if (authIsLoading) {
    status = "checkingAuth";
  } else if (!isAuthenticated) {
    status = "signedOut";
  } else if (userQueryIsLoading) {
    status = "checkingUser";
  } else if (user) {
    status = "ready";
  } else if (bootstrapPersistError) {
    status = "error";
  } else {
    status = "persistingUser";
  }

  const isLoading =
    status === "checkingAuth" ||
    status === "checkingUser" ||
    status === "persistingUser";

  return {
    status,
    isLoading,
    isAuthenticated: status === "ready",
    isSignedIn: isAuthenticated,
    authState: {
      userId: user?._id ?? null,
    },
    error: bootstrapPersistError,
  } satisfies PersistUserAuth;
}
