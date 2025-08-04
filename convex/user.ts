import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";

// Helper function to get unique user by token identifier
const getUserByTokenIdentifier = async (
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
) => {
  return await ctx.db
    .query("users")
    .withIndex("by_token_identifier", (q) =>
      q.eq("tokenIdentifier", tokenIdentifier),
    )
    .unique();
};

export const persist = mutation({
  args: {},
  returns: {
    userId: v.id("users"),
    status: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("no-change"),
    ),
  },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const user = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier);

    if (user !== null) {
      const updates: Partial<Doc<"users">> = {};

      if (user.name !== identity.name) {
        updates.name = identity.name;
      }

      if (user.email !== identity.email) {
        updates.email = identity.email;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);

        return {
          userId: user._id,
          status: "no-change",
        } as const;
      }

      return {
        userId: user._id,
        status: "no-change",
      } as const;
    }

    const userId = await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "",
      tokenIdentifier: identity.tokenIdentifier,
    });

    return {
      userId,
      status: "created",
    } as const;
  },
});

// For user persistence - allows null return for new users
export const getCurrentUserForPersistence = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(
        "Called getCurrentUserForPersistence without authentication present",
      );
    }

    const user = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier);

    // Return null for non-existent users instead of throwing an error
    // This allows the hook to properly detect new users and create them
    return user;
  },
});

// For protected routes - requires authenticated user
export const getCurrentUserAuthenticated = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier);

    if (!user) {
      throw new Error("User not found in database");
    }

    return user;
  },
});

// @deprecated Use getCurrentUserForPersistence or getCurrentUserAuthenticated instead
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called getCurrentUser without authentication present");
    }

    const user = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier);

    // Return null for non-existent users instead of throwing an error
    // This allows the hook to properly detect new users and create them
    return user;
  },
});
