import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED" });

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    const name = (identity.name ?? identity.givenName ?? "Neighbor").slice(0, 80);
    const email = identity.email ?? "";

    if (existing) {
      if (existing.name !== name || existing.email !== email) {
        await ctx.db.patch(existing._id, { name, email });
      }
      return existing._id;
    }
    // Role is ALWAYS "user" on creation. Promotion is an operator action.
    return ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name,
      email,
      role: "user",
      trustedLender: false,
    });
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const u = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    return u
      ? {
          _id: u._id,
          name: u.name,
          role: u.role,
          trustedLender: u.trustedLender,
        }
      : null; // never email
  },
});

// Internal: callable only from the CLI/dashboard, never from a client.
export const setRole = internalMutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { email, role }) => {
    const u = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (!u) throw new ConvexError({ code: "NOT_FOUND" });
    await ctx.db.patch(u._id, { role });
  },
});
