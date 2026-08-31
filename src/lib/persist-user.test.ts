import { describe, expect, it } from "bun:test";
import type { Id } from "@convex/_generated/dataModel";
import { derivePersistAuth } from "./persist-user-state";

const userId = "jd7user" as Id<"users">;

describe("derivePersistAuth", () => {
  it("stays on checkingAuth only while Convex has not confirmed a token", () => {
    expect(
      derivePersistAuth({
        convexAuthLoading: true,
        convexAuthenticated: false,
        user: null,
        createdUserId: null,
        error: null,
      }).status,
    ).toBe("checkingAuth");
  });

  it("is signedOut once Convex confirms there is no token", () => {
    expect(
      derivePersistAuth({
        convexAuthLoading: false,
        convexAuthenticated: false,
        user: null,
        createdUserId: null,
        error: null,
      }).status,
    ).toBe("signedOut");
  });

  it("stays ready when the user query emits a new snapshot of the same user", () => {
    const first = derivePersistAuth({
      convexAuthLoading: false,
      convexAuthenticated: true,
      user: { _id: userId },
      createdUserId: null,
      error: null,
    });
    const refreshed = derivePersistAuth({
      convexAuthLoading: false,
      convexAuthenticated: true,
      user: { _id: userId },
      createdUserId: null,
      error: null,
    });
    expect(first.status).toBe("ready");
    expect(refreshed.status).toBe("ready");
    expect(refreshed.authState.userId).toBe(userId);
  });

  it("does not drop a ready user if Convex reports loading without clearing authentication", () => {
    expect(
      derivePersistAuth({
        convexAuthLoading: true,
        convexAuthenticated: true,
        user: { _id: userId },
        createdUserId: null,
        error: null,
      }).status,
    ).toBe("ready");
  });

  it("uses the created user id until the persistence query catches up", () => {
    expect(
      derivePersistAuth({
        convexAuthLoading: false,
        convexAuthenticated: true,
        user: null,
        createdUserId: userId,
        error: null,
      }),
    ).toMatchObject({
      status: "ready",
      authState: { userId },
    });
  });
});
