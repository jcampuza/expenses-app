import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getMeDocument } from "./helpers";

// Get an invitation link for a user
export const getInvitationLink = mutation({
  returns: v.object({
    invitationLink: v.string(),
  }),
  handler: async (ctx) => {
    const me = await getMeDocument(ctx);

    const inviter = await ctx.db.get(me._id);

    if (!inviter) {
      throw new Error("Inviter not founddddd");
    }

    // Generate a unique token
    const token = Math.random().toString(36).substring(2);
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Store the invitation in the database
    await ctx.db.insert("invitations", {
      isUsed: false,
      token,
      inviterUserId: inviter._id,
      createdAt: new Date().toISOString(),
      expirationTime: expirationTime.toISOString(),
    });

    // Return the invitation link
    return {
      invitationLink: `/invite/${token}`,
    };
  },
});

// Expire all invitations for a user
export const expireAllInvitations = mutation({
  returns: v.null(),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const invitations = await ctx.db
      .query("invitations")
      .filter((q) => q.eq(q.field("inviterUserId"), user.tokenIdentifier))
      .collect();

    // Update each invitation to be expired
    for (const invitation of invitations) {
      await ctx.db.patch(invitation._id, {
        expirationTime: new Date(0).toISOString(), // Set to epoch time to expire
      });
    }

    return null;
  },
});

// Get user information from an invitation token
export const getInvitation = query({
  args: {
    token: v.string(),
  },
  returns: v.object({
    inviter: v.object({
      name: v.string(),
    }),
    invitation: v.object({
      token: v.string(),
      inviterUserId: v.string(),
      expirationTime: v.string(),
      isUsed: v.boolean(),
      createdAt: v.string(),
    }),
  }),
  handler: async (ctx, args) => {
    const { token } = args;

    const me = await getMeDocument(ctx);

    // Find the invitation
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if the invitation is for the current user
    if (invitation.inviterUserId === me._id) {
      throw new Error("You cannot accept your own invitation");
    }

    // Get the inviter's information
    const inviter = await ctx.db.get(invitation.inviterUserId);
    if (!inviter) {
      throw new Error("Inviter not foundddddd");
    }

    return {
      inviter: {
        name: inviter.name,
      },
      invitation: {
        token: invitation.token,
        inviterUserId: invitation.inviterUserId,
        expirationTime: invitation.expirationTime,
        isUsed: invitation.isUsed,
        createdAt: invitation.createdAt,
      },
    };
  },
});

// Accept an invitation
export const acceptInvitation = mutation({
  args: {
    token: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { token } = args;

    const me = await getMeDocument(ctx);

    // Find the invitation
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.isUsed) {
      throw new Error("Invitation has already been used");
    }

    // Check if the invitation has expired
    if (new Date(invitation.expirationTime) < new Date()) {
      throw new Error("Invitation has expired");
    }

    const inviter = await ctx.db.get(invitation.inviterUserId);
    if (!inviter) {
      throw new Error("Inviter not found");
    }

    // Check if the invitation is for the current user
    if (inviter._id === me._id) {
      throw new Error("You cannot accept your own invitation");
    }

    // Mark the invitation as used
    await ctx.db.patch(invitation._id, {
      isUsed: true,
    });

    // Create a connection between the users
    await ctx.db.insert("user_connections", {
      inviterUserId: inviter._id,
      inviteeUserId: me._id,
      acceptedAt: new Date().toISOString(),
    });

    return null;
  },
});

export const deleteExpiredInvitations = internalMutation({
  handler: async (ctx) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_creation_time", (q) =>
        q.lte(
          "_creationTime",
          new Date(Date.now() - 24 * 60 * 60 * 1000).getTime(),
        ),
      )
      .collect();

    for (const invitation of invitations) {
      const expirationTime = new Date(invitation.expirationTime).getTime();
      if (expirationTime < Date.now()) {
        await ctx.db.delete(invitation._id);
      }
    }
  },
});
