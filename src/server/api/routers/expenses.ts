import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  AddExpenseSchema,
  checkUsersConnection,
  getAllUserExpenses,
  UpdateExpenseSchema,
} from "~/server/db/queries";
import {
  addExpenseUseCase,
  deleteExpenseUseCase,
  getUsersSharedExpensesUseCase,
  updateExpenseUseCase,
} from "~/server/use-cases/expenses";
import { getUserUseCase } from "~/server/use-cases/user";

export const expensesRouter = createTRPCRouter({
  getMyExpenses: protectedProcedure.query(async ({ ctx }) => {
    const userExpenses = await getAllUserExpenses(ctx.db, ctx.session.userId);

    return { expenses: userExpenses };
  }),

  getExpenses: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
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

      const otherUser = await getUserUseCase(input.userId, {
        db: ctx.db,
        clerkClient: ctx.clerkClient,
      });

      if (!otherUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const sharedExpenses = await getUsersSharedExpensesUseCase(
        ctx.session.userId,
        input.userId,
        {
          db: ctx.db,
        },
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

      const res = await addExpenseUseCase(ctx.db, input);

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

      const res = await updateExpenseUseCase(ctx.db, input);

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

      const res = await deleteExpenseUseCase(ctx.db, input.id);

      return { success: res };
    }),
});
