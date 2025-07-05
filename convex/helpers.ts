import { Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

export const getMeDocument = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const me = await ctx.db
    .query("users")
    .withIndex("by_token_identifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  if (!me) {
    throw new Error("User not found");
  }

  return me;
};

export const getExpensesByUserId = async (
  ctx: QueryCtx,
  userId: Id<"users">,
) => {
  const userExpenses = await ctx.db
    .query("user_expenses")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const expenses = await Promise.all(
    userExpenses.map(async (ue) => {
      const expense = await ctx.db.get(ue.expenseId);
      return expense;
    }),
  );

  return expenses;
};
