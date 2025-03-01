import { and, desc, eq, inArray, lt, or } from "drizzle-orm";
import { z } from "zod";
import { type DB } from "~/server/db";
import {
  expenseParticipants,
  expenses,
  invitations,
  PaymentType,
  userConnections,
} from "~/server/db/schema";

export const checkUsersConnection = async (
  db: DB,
  userIdA: string,
  userIdB: string,
) => {
  const connection = await db.query.userConnections.findFirst({
    where: (connections, { or, and, eq }) =>
      or(
        and(
          eq(connections.inviterUserId, userIdA),
          eq(connections.inviteeUserId, userIdB),
        ),
        and(
          eq(connections.inviterUserId, userIdB),
          eq(connections.inviteeUserId, userIdA),
        ),
      ),
  });

  return connection;
};

export const getUsersSharedExpenses = async (
  db: DB,
  userIdA: string,
  userIdB: string,
) => {
  const sharedExpenses = await db
    .select({
      expense: expenses,
      participant: expenseParticipants,
    })
    .from(expenses)
    .leftJoin(
      expenseParticipants,
      eq(expenses.id, expenseParticipants.expenseId),
    )
    .where(
      and(
        // One of the users is the owner
        or(eq(expenses.ownerId, userIdA), eq(expenses.ownerId, userIdB)),
        // and one of the users is a participant
        or(
          eq(expenseParticipants.participantId, userIdA),
          eq(expenseParticipants.participantId, userIdB),
        ),
      ),
    )
    .orderBy(desc(expenses.date));

  const expensesWithBalance = sharedExpenses.map((expense) => {
    let balance = 0;

    const participant = expense.participant;
    if (!participant) {
      return {
        ...expense,
        balance: 0,
      };
    }

    if (expense.expense.ownerId === userIdA) {
      switch (participant.paymentType) {
        case "paid_by_owner_participant_owes": {
          balance = -expense.expense.totalCost;
          break;
        }
        case "paid_by_owner_split_equally": {
          balance = -expense.expense.totalCost / 2;
          break;
        }
        case "paid_by_participant_owner_owes": {
          balance = expense.expense.totalCost;
          break;
        }
        case "paid_by_participant_split_equally": {
          balance = expense.expense.totalCost / 2;
          break;
        }
      }
    } else {
      switch (participant.paymentType) {
        case "paid_by_owner_participant_owes": {
          balance = expense.expense.totalCost;
          break;
        }
        case "paid_by_owner_split_equally": {
          balance = expense.expense.totalCost / 2;
          break;
        }
        case "paid_by_participant_owner_owes": {
          balance = -expense.expense.totalCost;
          break;
        }
        case "paid_by_participant_split_equally": {
          balance = -expense.expense.totalCost / 2;
          break;
        }
      }
    }

    return {
      ...expense,
      balance,
    };
  });

  const totalBalance = expensesWithBalance.reduce(
    (sum, expense) => sum + expense.balance,
    0,
  );

  return {
    items: sharedExpenses,
    totalBalance,
  };
};

export const getAllUserExpenses = async (db: DB, userId: string) => {
  const allUserExpenses = await db
    .select()
    .from(expenses)
    .leftJoin(
      expenseParticipants,
      eq(expenses.id, expenseParticipants.expenseId),
    )
    .where(
      or(
        eq(expenses.ownerId, userId),
        eq(expenseParticipants.participantId, userId),
      ),
    );

  return allUserExpenses;
};

export const AddExpenseSchema = z.object({
  participant: z.object({
    participantId: z.string(),
    paymentType: z.enum(PaymentType.enumValues),
  }),
  expense: z.object({
    name: z.string(),
    totalCost: z.number(),
    category: z.string().optional(),
    ownerId: z.string(),
  }),
});

export const addExpense = async (
  db: DB,
  value: z.infer<typeof AddExpenseSchema>,
) => {
  const { expense, participant } = value;
  const res = await db.transaction(async (trx) => {
    const [expenseInsertResult] = await trx
      .insert(expenses)
      .values({
        name: expense.name,
        category: expense.category,
        totalCost: expense.totalCost,
        ownerId: expense.ownerId,
      })
      .returning();

    if (!expenseInsertResult) {
      return trx.rollback();
    }

    const [participantInsertResult] = await trx
      .insert(expenseParticipants)
      .values({
        expenseId: expenseInsertResult.id,
        participantId: participant.participantId,
        paymentType: participant.paymentType,
      })
      .returning();

    return {
      expense: expenseInsertResult,
      participant: participantInsertResult,
    };
  });

  return res;
};

export const UpdateExpenseSchema = z.object({
  user: z.object({
    id: z.string(),
  }),

  expense: z.object({
    id: z.number(),
    name: z.string().optional(),
    totalCost: z.number().optional(),
    category: z.string().optional().nullable(),
  }),

  participant: z.object({
    paymentType: z.enum(PaymentType.enumValues).optional(),
  }),
});

export const updateExpense = async (
  db: DB,
  update: z.infer<typeof UpdateExpenseSchema>,
) => {
  const { user, expense, participant } = update;
  // Check if expense exists and user has permission
  const [existingExpense] = await db
    .select({ expense: expenses, participant: expenseParticipants })
    .from(expenses)
    .leftJoin(
      expenseParticipants,
      eq(expenses.id, expenseParticipants.expenseId),
    )
    .where(eq(expenses.id, expense.id));

  if (!existingExpense) {
    throw new Error("Expense not found");
  }

  if (!existingExpense.participant) {
    throw new Error("Expense Participant not found");
  }

  // Check if user is involved in the expense
  const isOwner = existingExpense.expense.ownerId === user.id;
  const isParticipant = existingExpense.participant?.participantId === user.id;

  if (!isOwner && !isParticipant) {
    throw new Error("Not authorized to update this expense");
  }

  const res = await db.transaction(async (trx) => {
    // Update the expense details if provided
    const expenseUpdates: Partial<typeof expenses.$inferInsert> = {};

    if (update.expense.name !== undefined) {
      expenseUpdates.name = update.expense.name;
    }
    if (update.expense.category !== undefined) {
      expenseUpdates.category = update.expense.category;
    }
    if (update.expense.totalCost !== undefined) {
      expenseUpdates.totalCost = update.expense.totalCost;
    }

    // Only update expense if there are changes
    let expenseUpdateResult = existingExpense.expense;
    if (Object.keys(expenseUpdates).length > 0) {
      const [updatedExpense] = await trx
        .update(expenses)
        .set(expenseUpdates)
        .where(eq(expenses.id, expense.id))
        .returning();

      if (!updatedExpense) {
        return trx.rollback();
      }
      expenseUpdateResult = updatedExpense;
    }

    // Update payment type if provided
    let participantUpdateResult = existingExpense.participant;
    if (participant.paymentType !== undefined) {
      const [updatedParticipant] = await trx
        .update(expenseParticipants)
        .set({
          paymentType: participant.paymentType,
        })
        .where(eq(expenseParticipants.expenseId, expense.id))
        .returning();

      if (!updatedParticipant) {
        return trx.rollback();
      }
      participantUpdateResult = updatedParticipant;
    }

    return {
      expense: expenseUpdateResult,
      participant: participantUpdateResult,
    };
  });

  return res;
};

/**
 * expireInvitations
 *
 * Expires all invitations for the given user.
 * Defaults to the current time if no time is provided.
 */
export const expireInvitations = async (
  db: DB,
  userId: string,
  time = new Date(),
) => {
  await db
    .update(invitations)
    .set({ expirationTime: time.toISOString() })
    .where(eq(invitations.inviterUserId, userId));
};

export const getInvitationFromToken = async (db: DB, token: string) => {
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
  });

  return invitation;
};

export const acceptInvitation = async (
  db: DB,
  token: string,
  inviterUserId: string,
  inviteeUserId: string,
) => {
  await db.transaction(async (trx) => {
    await trx
      .update(invitations)
      .set({ isUsed: true })
      .where(eq(invitations.token, token));

    await trx.insert(userConnections).values({
      inviterUserId: inviterUserId,
      inviteeUserId: inviteeUserId,
      acceptedAt: new Date(),
    });
  });
};

export const createInvitationLink = async (db: DB, inviterUserId: string) => {
  const token = crypto.randomUUID();

  const expirationTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await db.insert(invitations).values({
    token,
    inviterUserId,
    expirationTime,
    isUsed: false,
    createdAt: new Date().toISOString(),
  });

  const invitationLink = `/invite/${token}`;

  return invitationLink;
};

export const getUsersConnections = async (db: DB, userId: string) => {
  const connections = await db
    .select()
    .from(userConnections)
    .where(
      or(
        eq(userConnections.inviteeUserId, userId),
        eq(userConnections.inviterUserId, userId),
      ),
    );

  return connections;
};

export const deleteExpense = async (db: DB, id: number) => {
  const res = await db.transaction(async (trx) => {
    const [deletedParticipant] = await trx
      .delete(expenseParticipants)
      .where(eq(expenseParticipants.expenseId, id))
      .returning();

    const [deletedExpense] = await trx
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();

    if (!deletedExpense || !deletedParticipant) {
      return trx.rollback();
    }

    return {
      expense: deletedExpense,
      participant: deletedParticipant,
    };
  });

  return res;
};

export const deleteExpiredInvitations = async (db: DB) => {
  const invitationsToDelete = await db
    .select()
    .from(invitations)
    .where(lt(invitations.expirationTime, new Date().toISOString()));

  await db.transaction(async (trx) => {
    await trx.delete(invitations).where(
      inArray(
        invitations.token,
        invitationsToDelete.map((i) => i.token),
      ),
    );
  });
};
