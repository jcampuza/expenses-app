import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { invitations } from "~/server/db/schema";

export const invitationsRouter = createTRPCRouter({
  getInviationLink: protectedProcedure
    .input(
      z.object({
        inviterUserId: z.string(), // Clerk user ID of the inviter
      }),
    )
    .output(
      z.object({
        invitationLink: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { inviterUserId } = input;
      const token = crypto.randomUUID();
      const expirationTime = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString(); // 24 hours

      await db.insert(invitations).values({
        token,
        inviterUserId,
        expirationTime,
        isUsed: false,
        createdAt: new Date().toISOString(),
      });

      const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${token}`;

      return { invitationLink };
    }),
});
