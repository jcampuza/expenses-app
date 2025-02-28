import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  real,
  text,
  pgEnum,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  category: text("category"),
  totalCost: real("total_cost").notNull(),
  currency: text("currency").default("USD").notNull(),
  ownerId: text("owner_id").notNull(),
});

export const PaymentTypes = {
  paid_by_owner_split_equally: "paid_by_owner_split_equally",
  paid_by_owner_participant_owes: "paid_by_owner_participant_owes",
  paid_by_participant_split_equally: "paid_by_participant_split_equally",
  paid_by_participant_owner_owes: "paid_by_participant_owner_owes",
} as const;

export const PAYMENT_TYPE = [
  PaymentTypes.paid_by_owner_split_equally,
  PaymentTypes.paid_by_owner_participant_owes,
  PaymentTypes.paid_by_participant_split_equally,
  PaymentTypes.paid_by_participant_owner_owes,
] as const;

export type PAYMENT_TYPE = (typeof PAYMENT_TYPE)[number];

// Simplified payment type enum
export const PaymentType = pgEnum("payment_type", PAYMENT_TYPE);

export const expenseParticipants = pgTable("expense_participants", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id")
    .notNull()
    .references(() => expenses.id),
  participantId: text("participant_id").notNull(),
  paymentType: PaymentType("payment_type").notNull(),
});

// Relations
export const expensesRelations = relations(expenses, ({ many }) => ({
  participants: many(expenseParticipants),
}));

export const expenseParticipantsRelations = relations(
  expenseParticipants,
  ({ one }) => ({
    expense: one(expenses, {
      fields: [expenseParticipants.expenseId],
      references: [expenses.id],
    }),
  }),
);

export const invitations = pgTable("invitations", {
  token: text("token").primaryKey(), // Unique invitation token
  inviterUserId: text("inviter_user_id").notNull(), // Clerk user ID of the inviter
  expirationTime: text("expiration_time").notNull(), // ISO string
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: text("created_at").notNull(), // ISO string
});

// New table to store connections between users.
// Whenever an invitation is accepted, you'll insert a record here that
// links the inviter's user ID with the invitee's user ID.
export const userConnections = pgTable("user_connections", {
  id: serial("id").primaryKey(),
  inviterUserId: text("inviter_user_id").notNull(), // User who sent the invitation
  inviteeUserId: text("invitee_user_id").notNull(), // User who accepted the invitation
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(), // Optional: timestamp (ISO string) when the connection was established
});
