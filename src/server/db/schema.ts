import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  date: text("date").notNull(),
  description: text("description"),
  category: text("category"),
  totalCost: real("total_cost").notNull(),
  currency: text("currency").default("USD").notNull(),
});

export const userExpenses = sqliteTable("user_expenses", {
  userId: text("user_id").notNull(),
  expenseId: integer("expense_id").notNull(),
  paymentType: text("payment_type", {
    enum: [
      "you_paid_total_they_owe",
      "you_paid_total_split_evenly",
      "they_paid_total_you_owe",
      "they_paid_total_split_evenly",
    ],
  }),
});

export const invitations = sqliteTable("invitations", {
  token: text("token").primaryKey(), // Unique invitation token
  inviterUserId: text("inviter_user_id").notNull(), // Clerk user ID of the inviter
  expirationTime: text("expiration_time").notNull(), // ISO string
  isUsed: integer("is_used", { mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at").notNull(), // ISO string
});
