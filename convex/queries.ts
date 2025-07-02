import { QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

type CheckUsersConnectionArgs = {
  connectionId: Id<"user_connections">;
  userId: Id<"users">;
};

export async function checkUsersConnection(
  convex: QueryCtx,
  { connectionId, userId }: CheckUsersConnectionArgs,
) {
  const connection = await convex.db
    .query("user_connections")
    .withIndex("by_id", (q) => q.eq("_id", connectionId))
    .first();

  if (!connection) {
    return null;
  }

  if (
    connection.inviterUserId !== userId &&
    connection.inviteeUserId !== userId
  ) {
    return null;
  }

  return connection;
}

export async function getUsersConnections(
  convex: QueryCtx,
  userId: Id<"users">,
) {
  const [invitedByMe, invitedMe] = await Promise.all([
    convex.db
      .query("user_connections")
      .withIndex("by_inviter", (q) => q.eq("inviterUserId", userId))
      .collect(),

    convex.db
      .query("user_connections")
      .withIndex("by_invitee", (q) => q.eq("inviteeUserId", userId))
      .collect(),
  ]);

  return [...invitedByMe, ...invitedMe];
}

// --- 2. Get shared expenses between two users, with balance calculation ---
type GetUsersSharedExpensesArgs = {
  userIdA: Id<"users">;
  userIdB: Id<"users">;
};

export async function getUsersSharedExpenses(
  convex: QueryCtx,
  { userIdA, userIdB }: GetUsersSharedExpensesArgs,
) {
  // Get all user_expenses for both users
  const [userAExpenses, userBExpenses] = await Promise.all([
    convex.db
      .query("user_expenses")
      .withIndex("by_user", (q) => q.eq("userId", userIdA))
      .collect(),
    convex.db
      .query("user_expenses")
      .withIndex("by_user", (q) => q.eq("userId", userIdB))
      .collect(),
  ]);

  console.log("userAExpenses", userAExpenses);
  console.log("userBExpenses", userBExpenses);

  // Find shared expenses (expenses where both users have entries)
  const userAExpenseIds = new Set(userAExpenses.map((e) => e.expenseId));
  const userBExpenseIds = new Set(userBExpenses.map((e) => e.expenseId));
  const sharedExpenseIds = [...userAExpenseIds].filter((id) =>
    userBExpenseIds.has(id),
  );

  // Get the actual expense documents for shared expenses
  const expenses = await Promise.all(
    sharedExpenseIds.map((id) => convex.db.get(id)),
  );

  const validExpenses = expenses.filter(
    (expense): expense is Doc<"expenses"> => expense !== null,
  );

  const shared: Array<{
    expense: Doc<"expenses">;
    userAExpense: Doc<"user_expenses">;
    userBExpense: Doc<"user_expenses">;
    userABalance: number;
    userBBalance: number;
  }> = [];

  for (const expense of validExpenses) {
    const userAExpense = userAExpenses.find((e) => e.expenseId === expense._id);
    const userBExpense = userBExpenses.find((e) => e.expenseId === expense._id);

    if (!userAExpense || !userBExpense) continue;

    // Calculate net balance for each user (what they paid minus what they owe)
    const userABalance = userAExpense.amountPaid - userAExpense.amountOwed;
    const userBBalance = userBExpense.amountPaid - userBExpense.amountOwed;

    shared.push({
      expense,
      userAExpense,
      userBExpense,
      userABalance,
      userBBalance,
    });
  }

  // Calculate total balance: positive means userA is owed money, negative means userA owes money
  const totalBalance = shared.reduce((sum, item) => sum + item.userABalance, 0);

  return {
    items: shared.map((item) => ({
      expense: item.expense,
      userAExpense: item.userAExpense,
      userBExpense: item.userBExpense,
      balance: item.userABalance, // How much userA is owed/owes for this expense
    })),
    totalBalance,
  };
}
