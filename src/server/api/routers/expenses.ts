import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  addExpense,
  AddExpenseSchema,
  checkUsersConnection,
  deleteExpense,
  getAllUserExpenses,
  getUsersSharedExpenses,
  updateExpense,
  UpdateExpenseSchema,
} from "~/server/db/queries";

export const expensesRouter = createTRPCRouter({
  getMyExpenses: protectedProcedure.query(async ({ ctx }) => {
    // Ensure the user is authenticated
    console.time("getMyExpenses");
    if (!ctx.session?.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const userExpenses = await getAllUserExpenses(ctx.db, ctx.session.userId);

    console.timeEnd("getMyExpenses");
    return { expenses: userExpenses };
  }),

  getExpenses: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Ensure the user is authenticated
      if (!ctx.session?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const connection = await checkUsersConnection(
        ctx.db,
        ctx.session.userId,
        input.userId,
      );
      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // make sure the users are actually connected
      const userConnection = await checkUsersConnection(
        ctx.db,
        ctx.session.userId,
        input.userId,
      );

      if (!userConnection) {
        // Users are not connected
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const otherUser = await ctx.clerkClient.users.getUser(input.userId);
      if (!otherUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const sharedExpenses = await getUsersSharedExpenses(
        ctx.db,
        ctx.session.userId,
        input.userId,
      );

      return {
        user: { name: otherUser.fullName ?? "unknown" },
        totalBalance: sharedExpenses.totalBalance,
        items: sharedExpenses.items,
      };
    }),

  addExpense: protectedProcedure
    .input(AddExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      // Ensure the user is authenticated
      if (!ctx.session?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const res = await addExpense(ctx.db, input);

      return { expense: res };
    }),

  updateExpense: protectedProcedure
    .input(UpdateExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const res = await updateExpense(ctx.db, input);

      return { expense: res };
    }),

  deleteExpense: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const res = await deleteExpense(ctx.db, input.id);

      return { success: res };
    }),
});
