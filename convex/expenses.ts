import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { checkUsersConnection, getUsersSharedExpenses } from "./queries";
import { getMeDocument, getExpensesByUserId } from "./helpers";

// Validator for adding an expense, including participants
const addExpenseValidator = v.object({
  name: v.string(),
  date: v.string(), // ISO string
  totalCost: v.number(),
  currency: v.string(),
  category: v.optional(v.string()),

  connectionId: v.id("user_connections"),
  paidBy: v.id("users"),
  splitEqually: v.boolean(),
});

// Validator for updating an expense
const updateExpenseValidator = v.object({
  id: v.id("expenses"),
  name: v.optional(v.string()),
  date: v.optional(v.string()), // ISO string
  totalCost: v.optional(v.number()),
  currency: v.optional(v.string()),
  category: v.optional(v.string()),

  connectionId: v.id("user_connections"),
  paidBy: v.id("users"),
  splitEqually: v.boolean(),
});

// Get all expenses where the current user is either the owner or a participant
export const getMyExpenses = query({
  args: {},
  handler: async (ctx) => {
    const me = await getMeDocument(ctx);
    const expenses = await getExpensesByUserId(ctx, me._id);

    return { expenses };
  },
});

// Get shared expenses between the current user and another user
export const getSharedExpenses = query({
  args: { connectionId: v.id("user_connections") }, // Clerk User ID
  handler: async (ctx, args) => {
    const me = await getMeDocument(ctx);

    const connection = await checkUsersConnection(ctx, {
      connectionId: args.connectionId,
      userId: me._id,
    });

    if (!connection) {
      throw new Error("Users are not connected");
    }

    const otherUserId =
      connection.inviteeUserId === me._id
        ? connection.inviterUserId
        : connection.inviteeUserId;

    // 2. Get the other user's details

    const otherUser = await ctx.db.get(otherUserId);

    if (!otherUser) {
      throw new Error("Other user not found");
    }

    const sharedExpenses = await getUsersSharedExpenses(ctx, {
      userIdA: me._id,
      userIdB: otherUserId,
    });

    return {
      user: { name: otherUser.name },
      totalBalance: sharedExpenses.totalBalance,
      items: sharedExpenses.items,
    };
  },
});

// Helper function to validate connection and get participants
const validateConnectionAndGetParticipants = async (
  ctx: QueryCtx,
  connectionId: Id<"user_connections">,
  currentUserId: Id<"users">,
) => {
  const connection = await ctx.db.get(connectionId);

  if (!connection) {
    throw new Error("Connection not found");
  }

  const isParticipant =
    connection.inviterUserId === currentUserId ||
    connection.inviteeUserId === currentUserId;

  if (!isParticipant) {
    throw new Error("You are not a participant in this connection");
  }

  const otherUserId =
    connection.inviterUserId === currentUserId
      ? connection.inviteeUserId
      : connection.inviterUserId;

  return { connection, otherUserId };
};

// Helper function to calculate expense amounts
const calculateExpenseAmounts = (
  totalCost: number,
  splitEqually: boolean,
  isPayerRecord: boolean,
) => {
  if (isPayerRecord) {
    return {
      amountPaid: totalCost,
      amountOwed: splitEqually ? totalCost / 2 : 0,
    };
  } else {
    return {
      amountPaid: 0,
      amountOwed: splitEqually ? totalCost / 2 : totalCost,
    };
  }
};

// Add a new expense
export const addExpense = mutation({
  args: addExpenseValidator,
  returns: v.object({
    _id: v.id("expenses"),
    _creationTime: v.number(),
    name: v.string(),
    date: v.string(),
    totalCost: v.number(),
    currency: v.string(),
    category: v.optional(v.string()),
    paidBy: v.id("users"),
  }),
  handler: async (ctx, args) => {
    const me = await getMeDocument(ctx);

    // Validate connection and get participants
    const { otherUserId } = await validateConnectionAndGetParticipants(
      ctx,
      args.connectionId,
      me._id,
    );

    // Determine payer and non-payer
    const payerId = args.paidBy;
    const nonPayerId = payerId === me._id ? otherUserId : me._id;

    // Create the expense record
    const expenseId = await ctx.db.insert("expenses", {
      name: args.name,
      date: args.date,
      category: args.category,
      totalCost: args.totalCost,
      currency: args.currency,
      paidBy: payerId,
    });

    // Create user_expenses records for both participants
    const payerAmounts = calculateExpenseAmounts(
      args.totalCost,
      args.splitEqually,
      true,
    );
    const nonPayerAmounts = calculateExpenseAmounts(
      args.totalCost,
      args.splitEqually,
      false,
    );

    await Promise.all([
      ctx.db.insert("user_expenses", {
        userId: payerId,
        expenseId: expenseId,
        ...payerAmounts,
      }),
      ctx.db.insert("user_expenses", {
        userId: nonPayerId,
        expenseId: expenseId,
        ...nonPayerAmounts,
      }),
    ]);

    const newExpense = await ctx.db.get(expenseId);
    if (!newExpense) {
      throw new Error("Failed to create expense");
    }

    return newExpense;
  },
});

// Update an existing expense
export const updateExpense = mutation({
  args: updateExpenseValidator,
  handler: async (ctx, args) => {
    const me = await getMeDocument(ctx);

    const { id, connectionId } = args;

    const connection = await ctx.db.get(connectionId);

    if (!connection) {
      throw new Error("Connection not found");
    }

    const isInviter = connection.inviterUserId === me._id;
    const isInvitee = connection.inviteeUserId === me._id;

    if (!isInviter && !isInvitee) {
      throw new Error("You are not a participant in this connection");
    }

    const existingExpense = await ctx.db.get(id);
    if (!existingExpense) {
      throw new Error("Expense not found");
    }

    await ctx.db.patch(id, {
      category: args.category,
      totalCost: args.totalCost,
      paidBy: args.paidBy,
      currency: args.currency,
      name: args.name,
      date: args.date,
    });

    // Get updated expense data
    const updatedExpense = await ctx.db.get(id);
    if (!updatedExpense) {
      throw new Error("Failed to get updated expense");
    }

    // Get existing user_expenses for this expense
    const existingUserExpenses = await ctx.db
      .query("user_expenses")
      .withIndex("by_expense", (q) => q.eq("expenseId", id))
      .collect();

    const payerId = args.paidBy;
    const totalCost = args.totalCost ?? existingExpense.totalCost;
    const splitEqually = args.splitEqually;

    // Update existing user_expenses records
    for (const userExpense of existingUserExpenses) {
      if (userExpense.userId === payerId) {
        // Update the payer's record
        await ctx.db.patch(userExpense._id, {
          amountPaid: totalCost,
          amountOwed: splitEqually ? totalCost / 2 : 0,
        });
      } else {
        // Update the non-payer's record
        await ctx.db.patch(userExpense._id, {
          amountPaid: 0,
          amountOwed: splitEqually ? totalCost / 2 : totalCost,
        });
      }
    }

    return { expense: updatedExpense };
  },
});

// Delete an expense
export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const me = await getMeDocument(ctx);

    // Fetch the expense to verify ownership if necessary
    const existingExpense = await ctx.db.get(args.id);
    if (!existingExpense) {
      throw new Error("Expense not found");
    }

    const userExpenses = await ctx.db
      .query("user_expenses")
      .withIndex("by_expense", (q) => q.eq("expenseId", args.id))
      .collect();

    const userExpensesUserIds = userExpenses.map((ue) => ue.userId);

    if (!userExpensesUserIds.includes(me._id)) {
      throw new Error("You are not a participant in this expense.");
    }

    for (const ue of userExpenses) {
      await ctx.db.delete(ue._id);
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});
