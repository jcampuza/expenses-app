import { v } from "convex/values";
import { query } from "./_generated/server";
import { getUsersConnections, getUsersSharedExpenses } from "./queries";
import { getMeDocument } from "./helpers";

export const getConnectionById = query({
  args: { id: v.id("user_connections") },
  returns: v.union(
    v.object({
      _id: v.id("user_connections"),
      inviterUserId: v.id("users"),
      inviteeUserId: v.id("users"),
      acceptedAt: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.id);

    if (!connection) {
      return null;
    }

    return {
      _id: connection._id,
      inviterUserId: connection.inviterUserId,
      inviteeUserId: connection.inviteeUserId,
      acceptedAt: connection.acceptedAt,
    };
  },
});

export const getConnectedUsers = query({
  args: {},
  returns: v.array(
    v.object({
      connectionId: v.id("user_connections"),
      userId: v.id("users"),
      name: v.string(),
      totalBalance: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const me = await getMeDocument(ctx);

    // Retrieve the connections from the database for the authenticated user.
    const connections = await getUsersConnections(ctx, me._id);

    if (!connections.length) {
      return [];
    }

    const result = await Promise.all(
      connections.map(async (connection) => {
        const otherUserId =
          connection.inviteeUserId === me._id
            ? connection.inviterUserId
            : connection.inviteeUserId;

        const sharedExpenses = await getUsersSharedExpenses(ctx, {
          userIdA: me._id,
          userIdB: otherUserId,
        });

        const otherUser = await ctx.db.get(otherUserId);

        return {
          connectionId: connection._id,
          userId: otherUserId,
          name: otherUser?.name ?? "They",
          totalBalance: sharedExpenses.totalBalance,
        };
      }),
    );

    return result;
  },
});
