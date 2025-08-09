import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  expenses: defineTable({
    name: v.string(),
    date: v.string(),
    category: v.optional(v.string()),
    totalCost: v.number(),
    currency: v.string(),
    paidBy: v.id("users"),

    originalCurrency: v.optional(v.string()),
    originalTotalCost: v.optional(v.number()),
    exchangeRate: v.optional(v.number()),
    conversionDate: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
  }),

  exchange_rates: defineTable({
    currency: v.string(),
    rate: v.number(),
    date: v.string(),
  })
    .index("by_currency_and_date", ["currency", "date"])
    .index("by_date", ["date"]),

  user_expenses: defineTable({
    userId: v.id("users"),
    expenseId: v.id("expenses"),
    amountPaid: v.number(),
    amountOwed: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_expense", ["expenseId"]),

  user_connections: defineTable({
    inviterUserId: v.id("users"),
    inviteeUserId: v.id("users"),
    acceptedAt: v.string(), // ISO string
  })
    .index("by_inviter_and_invitee", ["inviterUserId", "inviteeUserId"])
    .index("by_invitee", ["inviteeUserId"])
    .index("by_inviter", ["inviterUserId"]),

  invitations: defineTable({
    token: v.string(), // primary key in drizzle, but Convex uses _id
    inviterUserId: v.id("users"),
    expirationTime: v.string(), // ISO string
    isUsed: v.boolean(),
    createdAt: v.string(), // ISO string
  }).index("by_token", ["token"]),

  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index("by_token_identifier", ["tokenIdentifier"]),

  // Per-expense audit trail of changes
  expense_audit_logs: defineTable({
    expenseId: v.id("expenses"),
    actorUserId: v.id("users"),
    action: v.string(), // "create" | "update" | "delete"
    // Array of changed fields with before/after values
    changes: v.array(
      v.object({
        key: v.string(),
        before: v.optional(v.string()), // store actual value
        after: v.optional(v.string()),
      }),
    ),
    note: v.optional(v.string()),
  })
    .index("by_expense", ["expenseId"])
    .index("by_actor", ["actorUserId"])
    .index("by_expense_and_action", ["expenseId", "action"]),

  // Join table for fast "all my activity" queries
  audit_log_recipients: defineTable({
    logId: v.id("expense_audit_logs"),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_log", ["logId"]),
});
