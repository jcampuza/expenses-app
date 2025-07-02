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
  }),

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
});
