import type { Id } from "@convex/_generated/dataModel";

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

export function derivePersistAuth(input: {
  convexAuthLoading: boolean;
  convexAuthenticated: boolean;
  user: { _id: Id<"users"> } | null;
  createdUserId: Id<"users"> | null;
  error: Error | null;
}): PersistUserAuth {
  if (input.error) {
    return {
      status: "error",
      isLoading: false,
      isAuthenticated: false,
      isSignedIn: true,
      authState: { userId: null },
      error: input.error,
    };
  }

  if (!input.convexAuthenticated) {
    if (input.convexAuthLoading) {
      return {
        status: "checkingAuth",
        isLoading: true,
        isAuthenticated: false,
        isSignedIn: false,
        authState: { userId: null },
        error: null,
      };
    }
    return {
      status: "signedOut",
      isLoading: false,
      isAuthenticated: false,
      isSignedIn: false,
      authState: { userId: null },
      error: null,
    };
  }

  const userId = input.user?._id ?? input.createdUserId;
  if (userId) {
    return {
      status: "ready",
      isLoading: false,
      isAuthenticated: true,
      isSignedIn: true,
      authState: { userId },
      error: null,
    };
  }

  return {
    status: "persistingUser",
    isLoading: true,
    isAuthenticated: true,
    isSignedIn: true,
    authState: { userId: null },
    error: null,
  };
}
