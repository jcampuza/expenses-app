import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import {
  getUserExpenseRows,
  getUsersConnections,
  sharedBalanceFromExpenseRows,
} from "./queries";
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
    const connection = await ctx.db.get("user_connections", args.id);

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

    const myExpenseRows = await getUserExpenseRows(ctx, me._id);

    const result = await Promise.all(
      connections.map(async (connection) => {
        const otherUserId =
          connection.inviteeUserId === me._id
            ? connection.inviterUserId
            : connection.inviteeUserId;

        const [otherExpenseRows, otherUser] = await Promise.all([
          getUserExpenseRows(ctx, otherUserId),
          ctx.db.get("users", otherUserId),
        ]);

        return {
          connectionId: connection._id,
          userId: otherUserId,
          name: otherUser?.name ?? "They",
          totalBalance: sharedBalanceFromExpenseRows(
            myExpenseRows,
            new Set(otherExpenseRows.map((row) => row.expenseId)),
          ),
        };
      }),
    );

    return result;
  },
});

export const getConnectedUsersForSettings = query({
  args: {},
  returns: v.array(
    v.object({
      connectionId: v.id("user_connections"),
      userId: v.id("users"),
      name: v.string(),
      email: v.optional(v.string()),
      connectedAt: v.string(),
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

        const otherUser = await ctx.db.get("users", otherUserId);

        return {
          connectionId: connection._id,
          userId: otherUserId,
          name: otherUser?.name ?? "Unknown User",
          email: otherUser?.email,
          connectedAt: connection.acceptedAt,
        };
      }),
    );

    return result;
  },
});

export const deleteConnection = mutation({
  args: { connectionId: v.id("user_connections") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getMeDocument(ctx);

    // Get the connection to verify the user is part of it
    const connection = await ctx.db.get("user_connections", args.connectionId);

    if (!connection) {
      throw new Error("Connection not found");
    }

    // Verify the authenticated user is part of this connection
    if (
      connection.inviterUserId !== me._id &&
      connection.inviteeUserId !== me._id
    ) {
      throw new Error("Unauthorized to delete this connection");
    }

    // Get the other user's ID
    const otherUserId =
      connection.inviterUserId === me._id
        ? connection.inviteeUserId
        : connection.inviterUserId;

    const [myExpenseRows, otherExpenseRows] = await Promise.all([
      getUserExpenseRows(ctx, me._id),
      getUserExpenseRows(ctx, otherUserId),
    ]);
    const otherExpenseById = new Map(
      otherExpenseRows.map((row) => [row.expenseId, row]),
    );

    for (const myRow of myExpenseRows) {
      const otherRow = otherExpenseById.get(myRow.expenseId);
      if (!otherRow) {
        continue;
      }

      await ctx.db.delete("user_expenses", myRow._id);
      await ctx.db.delete("user_expenses", otherRow._id);
      await ctx.db.delete("expenses", myRow.expenseId);
    }

    // Finally, delete the connection
    await ctx.db.delete("user_connections", args.connectionId);

    return null;
  },
});
