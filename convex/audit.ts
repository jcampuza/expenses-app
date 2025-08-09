import { query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { getMeDocument } from "./helpers";
import { assertUsersConnection } from "./queries";

// Only track explicit keys we care about for audit history
const EXPENSE_AUDIT_FIELDS: Array<keyof Doc<"expenses">> = [
  "name",
  "date",
  "category",
  "totalCost",
  "currency",
  "paidBy",
  "originalCurrency",
  "originalTotalCost",
  "exchangeRate",
  "conversionDate",
];

export function computeExpenseChanges(
  before: Partial<Doc<"expenses">> | null,
  after: Partial<Doc<"expenses">> | null,
): Array<{ key: string; before?: string; after?: string }> {
  const changes: Array<{
    key: string;
    before?: string;
    after?: string;
  }> = [];

  for (const key of EXPENSE_AUDIT_FIELDS) {
    const beforeVal = before
      ? (before as Partial<Doc<"expenses">>)[key]
      : undefined;
    const afterVal = after
      ? (after as Partial<Doc<"expenses">>)[key]
      : undefined;

    const beforeStr =
      beforeVal === undefined ? undefined : JSON.stringify(beforeVal);
    const afterStr =
      afterVal === undefined ? undefined : JSON.stringify(afterVal);
    if (beforeStr !== afterStr) {
      changes.push({
        key: String(key),
        before: beforeStr,
        after: afterStr,
      });
    }
  }

  return changes;
}

export async function addExpenseCreatedAuditLog(
  ctx: MutationCtx,
  actorUserId: Id<"users">,
  expense: Doc<"expenses">,
) {
  const changes = computeExpenseChanges(null, expense);
  const logId = await ctx.db.insert("expense_audit_logs", {
    expenseId: expense._id,
    actorUserId,
    action: "create",
    changes,
    note: undefined,
  });

  const participants = await ctx.db
    .query("user_expenses")
    .withIndex("by_expense", (q) => q.eq("expenseId", expense._id))
    .collect();
  for (const ue of participants) {
    await ctx.db.insert("audit_log_recipients", { logId, userId: ue.userId });
  }
}

export async function addExpenseUpdatedAuditLog(
  ctx: MutationCtx,
  actorUserId: Id<"users">,
  before: Doc<"expenses">,
  after: Doc<"expenses">,
) {
  const changes = computeExpenseChanges(before, after);
  if (changes.length === 0) return;
  const logId = await ctx.db.insert("expense_audit_logs", {
    expenseId: after._id,
    actorUserId,
    action: "update",
    changes,
    note: undefined,
  });

  const participants = await ctx.db
    .query("user_expenses")
    .withIndex("by_expense", (q) => q.eq("expenseId", after._id))
    .collect();
  for (const ue of participants) {
    await ctx.db.insert("audit_log_recipients", { logId, userId: ue.userId });
  }
}

export async function addExpenseDeletedAuditLog(
  ctx: MutationCtx,
  actorUserId: Id<"users">,
  before: Doc<"expenses">,
) {
  const changes = computeExpenseChanges(before, null);
  const logId = await ctx.db.insert("expense_audit_logs", {
    expenseId: before._id,
    actorUserId,
    action: "delete",
    changes,
    note: undefined,
  });

  const participants = await ctx.db
    .query("user_expenses")
    .withIndex("by_expense", (q) => q.eq("expenseId", before._id))
    .collect();
  for (const ue of participants) {
    await ctx.db.insert("audit_log_recipients", { logId, userId: ue.userId });
  }
}

export const getExpenseAuditLogs = query({
  args: { expenseId: v.id("expenses") },
  handler: async (ctx, args) => {
    // Authorization: only participants of the expense can view logs
    const userExpenses = await ctx.db
      .query("user_expenses")
      .withIndex("by_expense", (q) => q.eq("expenseId", args.expenseId))
      .collect();

    const me = await ctx.auth.getUserIdentity();
    if (!me) throw new Error("Not authenticated");

    const meDoc = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", me.tokenIdentifier),
      )
      .unique();

    if (!meDoc) throw new Error("User not found");

    const participantIds = new Set(userExpenses.map((ue) => ue.userId));
    if (!participantIds.has(meDoc._id)) {
      throw new Error("Unauthorized to view audit logs for this expense");
    }

    const logs = await ctx.db
      .query("expense_audit_logs")
      .withIndex("by_expense", (q) => q.eq("expenseId", args.expenseId))
      .collect();

    return logs;
  },
});

// Personal activity feed for the authenticated user
export const getMyActivityFeed = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!me) throw new Error("User not found");

    const recipientRows = await ctx.db
      .query("audit_log_recipients")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    const logs = await Promise.all(
      recipientRows.map((r) => ctx.db.get(r.logId)),
    );
    const validLogs = logs.filter(
      (l): l is Doc<"expense_audit_logs"> => l !== null,
    );

    return validLogs;
  },
});

async function getActivityBetweenUsers(
  ctx: QueryCtx,
  meId: Id<"users">,
  otherUserId: Id<"users">,
) {
  // Intersect recipient rows for both users
  const [myRecipients, otherRecipients] = await Promise.all([
    ctx.db
      .query("audit_log_recipients")
      .withIndex("by_user", (q) => q.eq("userId", meId))
      .collect(),
    ctx.db
      .query("audit_log_recipients")
      .withIndex("by_user", (q) => q.eq("userId", otherUserId))
      .collect(),
  ]);

  const myLogIds = new Set(myRecipients.map((r) => r.logId));
  const intersectionLogIds = otherRecipients
    .map((r) => r.logId)
    .filter((id: Id<"expense_audit_logs">) => myLogIds.has(id));

  if (intersectionLogIds.length === 0)
    return [] as Array<
      Doc<"expense_audit_logs"> & {
        actor: { _id: Id<"users">; name: string } | null;
      }
    >;

  const logs = (
    await Promise.all(
      intersectionLogIds.map((id: Id<"expense_audit_logs">) => ctx.db.get(id)),
    )
  ).filter((l): l is Doc<"expense_audit_logs"> => l !== null);

  const actorIdsSet = new Set(logs.map((l) => l.actorUserId as Id<"users">));
  const actorDocs = (
    await Promise.all(
      Array.from(actorIdsSet).map((id: Id<"users">) => ctx.db.get(id)),
    )
  ).filter((d): d is Doc<"users"> => d !== null);
  const actorById = new Map<Id<"users">, Doc<"users">>(
    actorDocs.map((d) => [d._id, d]),
  );

  logs.sort((a, b) => b._creationTime - a._creationTime);

  return logs.map((log) => {
    const actor = actorById.get(log.actorUserId as Id<"users">) ?? null;
    return {
      ...log,
      actor: actor ? { _id: actor._id, name: actor.name } : null,
    };
  });
}

// Activity on expenses shared between the current user and another user
export const getActivityWithUser = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const me = await getMeDocument(ctx);

    return getActivityBetweenUsers(ctx, me._id, args.otherUserId);
  },
});

// Activity between current user and the other user in a connection
export const getActivityForConnection = query({
  args: { connectionId: v.id("user_connections") },
  handler: async (ctx, args) => {
    const me = await getMeDocument(ctx);

    const connection = await assertUsersConnection(ctx, {
      connectionId: args.connectionId,
      userId: me._id,
    });

    return getActivityBetweenUsers(ctx, me._id, connection.inviteeUserId);
  },
});
