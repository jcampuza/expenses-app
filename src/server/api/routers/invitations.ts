import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { invitations } from "~/server/db/schema";
import {
  acceptInvitation,
  createInvitationLink,
  expireInvitations,
  getInvitationFromToken,
} from "~/server/db/queries";

export const invitationsRouter = createTRPCRouter({
  getInviationLink: protectedProcedure
    .input(z.object({ inviterUserId: z.string() }))
    .output(z.object({ invitationLink: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { inviterUserId } = input;

      const invitationLink = await createInvitationLink(ctx.db, inviterUserId);

      return { invitationLink, success: true };
    }),

  expireAllInvitations: protectedProcedure.mutation(async ({ ctx }) => {
    await expireInvitations(ctx.db, ctx.session.userId);

    return { success: true };
  }),

  getUserFromInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .output(z.object({ userId: z.string(), name: z.string() }))
    .query(async ({ input, ctx }) => {
      const { token } = input;

      // Retrieve invitation by token
      const invite = await ctx.db.query.invitations.findFirst({
        where: eq(invitations.token, token),
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invite.isUsed) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation has already been used",
        });
      }

      // Check if the invitation has expired
      if (new Date(invite.expirationTime) < new Date()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation has expired",
        });
      }

      // Check if the invitation is you
      if (invite.inviterUserId === ctx.session.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot accept your own invitation",
        });
      }

      // Check to make sure the user who sent the invitations actually exists still
      const user = await ctx.clerkClient.users.getUser(invite.inviterUserId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        userId: user.id,
        name: user.fullName ?? "unknown",
      };
    }),

  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { token } = input;

      // Retrieve invitation by token
      const invite = await getInvitationFromToken(ctx.db, token);
      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invite.isUsed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has already been used",
        });
      }

      // Check if the invitation has expired
      if (new Date(invite.expirationTime) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      // Check to make sure the user who sent the invitations still exists
      const user = await ctx.clerkClient.users.getUser(invite.inviterUserId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Accept the invitation
      await acceptInvitation(
        ctx.db,
        token,
        invite.inviterUserId,
        ctx.session.userId,
      );

      return { success: true };
    }),
});
