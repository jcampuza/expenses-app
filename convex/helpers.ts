import { getUserExpenseRows } from "./queries";
import { Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

export const requireIdentity = async (
  ctx: QueryCtx,
  message = "Not authenticated",
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error(message);
  }
  return identity;
};

export const getMeDocument = async (ctx: QueryCtx) => {
  const identity = await requireIdentity(ctx);

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
  const userExpenses = await getUserExpenseRows(ctx, userId);

  const expenses = await Promise.all(
    userExpenses.map(async (ue) => {
      const expense = await ctx.db.get("expenses", ue.expenseId);
      return expense;
    }),
  );

  return expenses;
};
