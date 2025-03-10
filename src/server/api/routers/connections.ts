import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  getUsersConnections,
  getUsersSharedExpenses,
} from "~/server/db/queries";
import { getUserUseCase } from "~/server/use-cases/user";

export const connectionsRouter = createTRPCRouter({
  getConnectedUsers: protectedProcedure.query(async ({ ctx }) => {
    // Retrieve the expenses from the database for the authenticated user.
    const connections = await getUsersConnections(ctx.db, ctx.session.userId);

    const otherUserIds = Array.from(
      new Set(
        connections.map((user) => {
          return user.inviteeUserId === ctx.session.userId
            ? user.inviterUserId
            : user.inviteeUserId;
        }),
      ),
    );

    if (!otherUserIds.length) {
      return { users: [] };
    }

    const otherUsers = await Promise.all(
      otherUserIds.map((userId) =>
        getUserUseCase(userId, {
          db: ctx.db,
          clerkClient: ctx.clerkClient,
        }),
      ),
    );

    const otherUsersFiltered = otherUsers.filter((user) => !!user);

    const otherUsersInfo = await Promise.all(
      otherUsersFiltered.map(async (user) => {
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
