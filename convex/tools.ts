import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { categoryV, conditionV } from "./constants";
import { assertOwner, requireUser } from "./lib/auth";
import { isOnLoan } from "./lib/loans";
import type { Id } from "./_generated/dataModel";

const fields = {
  name: v.string(),
  category: categoryV,
  condition: conditionV,
  description: v.string(),
};

function clean(a: { name: string; description: string }) {
  const name = a.name.trim();
  const description = a.description.trim();
  if (name.length < 2 || name.length > 60 || description.length > 280) {
    throw new ConvexError({ code: "INVALID_INPUT" });
  }
  return { name, description };
}

// PUBLIC: no auth, name + category only. No owner, no description, no ids that reveal people.
export const publicList = query({
  args: {},
  handler: async (ctx) => {
    const out: { _id: Id<"tools">; name: string; category: string }[] = [];
    for await (const t of ctx.db.query("tools").order("desc")) {
      if (!(await isOnLoan(ctx, t._id))) {
        out.push({ _id: t._id, name: t.name, category: t.category });
        if (out.length === 60) break;
      }
    }
    return out;
  },
});

// AUTHED board: everything, with availability. The UI filters by category client-side so layout animates instantly.
export const board = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    const tools = await ctx.db.query("tools").order("desc").take(200);
    return Promise.all(
      tools.map(async (t) => {
        const owner = await ctx.db.get(t.ownerId);
        const onLoan = await isOnLoan(ctx, t._id);
        return {
          _id: t._id,
          name: t.name,
          category: t.category,
          condition: t.condition,
          description: t.description,
          ownerId: t.ownerId,
          ownerName: owner?.name ?? "Neighbor",
          trusted: owner?.trustedLender ?? false,
          status: onLoan ? ("on_loan" as const) : ("available" as const),
        };
      })
    );
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .take(100);
  },
});

export const create = mutation({
  args: fields,
  handler: async (ctx, a) => {
    const user = await requireUser(ctx);
    return ctx.db.insert("tools", {
      ownerId: user._id,
      category: a.category,
      condition: a.condition,
      ...clean(a),
    });
  },
});

export const update = mutation({
  args: { toolId: v.id("tools"), ...fields },
  handler: async (ctx, { toolId, ...a }) => {
    const user = await requireUser(ctx);
    const tool = await ctx.db.get(toolId);
    if (!tool) throw new ConvexError({ code: "NOT_FOUND" });
    assertOwner(user, tool.ownerId); // spec: edit only your own, even for admins
    await ctx.db.patch(toolId, {
      category: a.category,
      condition: a.condition,
      ...clean(a),
    });
  },
});

export const remove = mutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, { toolId }) => {
    const user = await requireUser(ctx);
    const tool = await ctx.db.get(toolId);
    if (!tool) throw new ConvexError({ code: "NOT_FOUND" });
    const isAdmin = user.role === "admin";
    if (!isAdmin) assertOwner(user, tool.ownerId); // owner OR admin

    const loans = await ctx.db
      .query("loans")
      .withIndex("by_tool_status", (q) => q.eq("toolId", toolId))
      .collect();

    if (!isAdmin && loans.some((l) => l.status === "approved")) {
      throw new ConvexError({ code: "ON_LOAN" });
    }

    for (const l of loans) {
      if (l.status === "pending" || l.status === "approved") {
        await ctx.db.patch(l._id, { status: "cancelled" });
      }
    }

    await ctx.db.delete(toolId); // mutations are transactional: all or nothing
  },
});
