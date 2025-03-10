import { z } from "zod";
import { DB } from "~/server/db";
import {
  addExpense,
  AddExpenseSchema,
  deleteExpense,
  getUsersSharedExpenses,
  updateExpense,
  UpdateExpenseSchema,
} from "~/server/db/queries";

// const sortUserIds = (userIdA: string, userIdB: string) => {
//   if (userIdA < userIdB) {
//     return [userIdA, userIdB] as const;
//   }

//   return [userIdB, userIdA] as const;
// };

// export const generateUsersSharedExpensesCacheKey = (
//   userIdA: string,
//   userIdB: string,
// ) => {
//   const sortedUserIds = sortUserIds(userIdA, userIdB);
//   return `usersSharedExpenses:${sortedUserIds[0]}:${sortedUserIds[1]}`;
// };

type SharedExpensesResult = Awaited<ReturnType<typeof getUsersSharedExpenses>>;

export const getUsersSharedExpensesUseCase = async (
  userIdA: string,
  userIdB: string,
  { db }: { db: DB },
): Promise<SharedExpensesResult> => {
  // const cacheKey = generateUsersSharedExpensesCacheKey(userIdA, userIdB);
  // const cachedExpenses = await readCache(db, cacheKey);

  // if (cachedExpenses) {
  //   console.log("cache hit on expenses", cacheKey);
  //   return cachedExpenses.value as SharedExpensesResult;
  // }

  const queryResponse = await getUsersSharedExpenses(db, userIdA, userIdB);

  // await insertCache(
  //   db,
  //   cacheKey,
  //   queryResponse,
  //   new Date(Date.now() + 1000 * 60 * 60),
  // );

  return queryResponse;
};

export const updateExpenseUseCase = async (
  db: DB,
  input: z.infer<typeof UpdateExpenseSchema>,
) => {
  const res = await updateExpense(db, input);

  // await invalidateCache(
  //   db,
  //   generateUsersSharedExpensesCacheKey(
  //     res.expense.ownerId,
  //     res.participant?.participantId ?? "",
  //   ),
  // );

  return res;
};

export const addExpenseUseCase = async (
  db: DB,
  input: z.infer<typeof AddExpenseSchema>,
) => {
  const res = await addExpense(db, input);

  // await invalidateCache(
  //   db,
  //   generateUsersSharedExpensesCacheKey(
  //     res.expense.ownerId,
  //     res.participant?.participantId ?? "",
  //   ),
  // );

  return res;
};

export const deleteExpenseUseCase = async (db: DB, id: number) => {
  const res = await deleteExpense(db, id);

  // await invalidateCache(
  //   db,
  //   generateUsersSharedExpensesCacheKey(
  //     res.expense.ownerId,
  //     res.participant?.participantId ?? "",
  //   ),
  // );

  return res;
};
