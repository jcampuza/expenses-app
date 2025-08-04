import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";

export type AuthState = {
  userId: Id<"users"> | null;
};

export function usePersistUserEffect() {
  const { isLoading: authIsLoading, isAuthenticated } = useConvexAuth();

  const { data: user, isLoading: userQueryIsLoading } = useQuery(
    convexQuery(api.user.getCurrentUser, isAuthenticated ? {} : "skip"),
  );

  const { mutate: storeUser, isPending: isStoringUser } = useMutation({
    mutationFn: useConvexMutation(api.user.persist),
  });

  useEffect(() => {
    // Don't do anything until we know if the user exists or not.
    if (!isAuthenticated || userQueryIsLoading) {
      return;
    }

    // This will run for new users (user is null) and existing users (user is not null).
    // For existing users, it's a background sync that won't block the UI.
    // For new users, the `isCreatingUser` flag will be used to block the UI.
    storeUser({});
  }, [isAuthenticated, storeUser, userQueryIsLoading]);

  const isCreatingUser = user === null && isStoringUser;
  const isLoading = authIsLoading || userQueryIsLoading || isCreatingUser;

  return {
    isLoading,
    // A user is considered fully authenticated and ready once they exist in the DB.
    isAuthenticated: isAuthenticated && !!user,
    authState: {
      userId: user?._id ?? null,
    },
  };
}
