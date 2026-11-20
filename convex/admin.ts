import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

export const allLoans = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const loans = await ctx.db.query("loans").order("desc").take(200);
    return Promise.all(
      loans.map(async (l) => ({
        _id: l._id,
        status: l.status,
        startDate: l.startDate,
        endDate: l.endDate,
        toolName: (await ctx.db.get(l.toolId))?.name ?? "Removed tool",
        owner: (await ctx.db.get(l.ownerId))?.name ?? "?",
        borrower: (await ctx.db.get(l.borrowerId))?.name ?? "?",
      }))
    );
  },
});

export const lenders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").take(200);
    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      role: u.role,
      trustedLender: u.trustedLender,
    }));
  },
});

export const setTrusted = mutation({
  args: { userId: v.id("users"), trusted: v.boolean() },
  handler: async (ctx, { userId, trusted }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(userId, { trustedLender: trusted });
  },
});
