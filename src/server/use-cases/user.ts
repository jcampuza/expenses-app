import { ClerkClient } from "@clerk/backend";
import { DB } from "~/server/db";
import { insertCache, readCache } from "~/server/db/queries";

const generateUserCacheKey = (userId: string) => `user:${userId}`;

export type MappedUser = {
  id: string;
  fullName: string;
};

export const getUserUseCase = async (
  userId: string,
  {
    db,
    clerkClient,
  }: {
    db: DB;
    clerkClient: ClerkClient;
  },
): Promise<MappedUser | null> => {
  const cacheKey = generateUserCacheKey(userId);
  const cachedUser = await readCache(db, cacheKey);

  if (cachedUser) {
    return cachedUser.value as MappedUser;
  }

  const user = await clerkClient.users.getUser(userId);
  if (!user) {
    return null;
  }

  const mappedUser: MappedUser = {
    id: user.id,
    fullName: user.fullName ?? "Unknown",
  };

  await insertCache(
    db,
    cacheKey,
    mappedUser,
    new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  );

  return mappedUser;
};
