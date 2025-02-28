import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  getUsersConnections,
  getUsersSharedExpenses,
} from "~/server/db/queries";

export const connectionsRouter = createTRPCRouter({
  getConnectedUsers: protectedProcedure.query(async ({ ctx }) => {
    // Retrieve the expenses from the database for the authenticated user.
    const connections = await getUsersConnections(ctx.db, ctx.session.userId);

    const otherUserIds = connections.map((user) => {
      return user.inviteeUserId === ctx.session.userId
        ? user.inviterUserId
        : user.inviteeUserId;
    });

    if (!otherUserIds.length) {
      return { users: [] };
    }

    const otherUsers = await ctx.clerkClient.users.getUserList({
      userId: otherUserIds,
    });

    const otherUsersInfo = await Promise.all(
      otherUsers.data.map(async (user) => {
        const sharedExpenses = await getUsersSharedExpenses(
          ctx.db,
          ctx.session.userId,
          user.id,
        );

        return {
          userId: user.id,
          name: user.fullName ?? "They",
          totalBalance: sharedExpenses.totalBalance,
        };
      }),
    );

    return { users: otherUsersInfo };
  }),
});
