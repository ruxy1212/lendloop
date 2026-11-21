import { ConvexError, v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const store = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED" });

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    const email = (args.email ?? identity.email ?? "").trim();
    const emailHandle = email.includes("@") ? email.split("@")[0] : "";
    const name = (
      args.name?.trim() ||
      identity.name?.trim() ||
      identity.givenName?.trim() ||
      emailHandle ||
      "Neighbor"
    ).slice(0, 80);

    if (existing) {
      const updates: { name?: string; email?: string } = {};
      if (existing.name !== name && name !== "Neighbor") {
        updates.name = name;
      }
      if (existing.email !== email && email !== "") {
        updates.email = email;
      }
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
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
    email: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { email, role }) => {
    let u = null;
    if (email) {
      u = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
    }
    // Fallback: If email claim was empty in Clerk JWT, match the most recently active user
    if (!u) {
      u = await ctx.db.query("users").order("desc").first();
    }
    if (!u) throw new ConvexError({ code: "NOT_FOUND" });
    await ctx.db.patch(u._id, {
      role,
      ...(email ? { email } : {}),
    });
    return { id: u._id, role, email: email ?? u.email };
  },
});
