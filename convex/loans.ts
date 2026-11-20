import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { assertOwner, requireUser } from "./lib/auth";
import { hasOverlap, todayUTC, validateRange } from "./lib/loans";

async function hydrate(
  ctx: QueryCtx,
  loan: Doc<"loans">,
  viewer: "owner" | "borrower"
) {
  const [tool, other, ev] = await Promise.all([
    ctx.db.get(loan.toolId),
    ctx.db.get(viewer === "owner" ? loan.borrowerId : loan.ownerId),
    ctx.db
      .query("automationEvents")
      .withIndex("by_loan", (q) => q.eq("loanId", loan._id))
      .order("desc")
      .first(),
  ]);

  return {
    _id: loan._id,
    status: loan.status,
    startDate: loan.startDate,
    endDate: loan.endDate,
    overdue: loan.status === "approved" && loan.endDate < todayUTC(),
    toolName: tool?.name ?? "Removed tool",
    counterpart: other?.name ?? "Neighbor", // name only, never email
    activity: ev
      ? { kind: ev.kind, status: ev.status, at: ev.updatedAt }
      : null, // bonus feature
  };
}

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const u = await requireUser(ctx);
    const rows = await ctx.db
      .query("loans")
      .withIndex("by_borrower", (q) => q.eq("borrowerId", u._id))
      .order("desc")
      .take(100);
    return Promise.all(rows.map((l) => hydrate(ctx, l, "borrower")));
  },
});

export const incoming = query({
  args: {},
  handler: async (ctx) => {
    const u = await requireUser(ctx);
    const rows = await ctx.db
      .query("loans")
      .withIndex("by_owner", (q) => q.eq("ownerId", u._id))
      .order("desc")
      .take(100);
    return Promise.all(rows.map((l) => hydrate(ctx, l, "owner")));
  },
});

// For the date picker: approved ranges only, no identities.
export const bookedRanges = query({
  args: { toolId: v.id("tools") },
  handler: async (ctx, { toolId }) => {
    await requireUser(ctx);
    const rows = await ctx.db
      .query("loans")
      .withIndex("by_tool_status", (q) =>
        q.eq("toolId", toolId).eq("status", "approved")
      )
      .collect();
    return rows.map((l) => ({ from: l.startDate, to: l.endDate }));
  },
});

export const request = mutation({
  args: { toolId: v.id("tools"), startDate: v.string(), endDate: v.string() },
  handler: async (ctx, a) => {
    const user = await requireUser(ctx);
    const tool = await ctx.db.get(a.toolId);
    if (!tool) throw new ConvexError({ code: "NOT_FOUND" });
    if (tool.ownerId === user._id) throw new ConvexError({ code: "OWN_TOOL" });
    validateRange(a.startDate, a.endDate);
    if (await hasOverlap(ctx, tool._id, a.startDate, a.endDate)) {
      throw new ConvexError({ code: "CONFLICT" });
    }

    const duplicate = await ctx.db
      .query("loans")
      .withIndex("by_borrower_tool_status", (q) =>
        q
          .eq("borrowerId", user._id)
          .eq("toolId", tool._id)
          .eq("status", "pending")
      )
      .first();
    if (duplicate) throw new ConvexError({ code: "DUPLICATE" });

    const id = await ctx.db.insert("loans", {
      toolId: tool._id,
      ownerId: tool.ownerId,
      borrowerId: user._id, // owner derived from the tool, never from the client
      startDate: a.startDate,
      endDate: a.endDate,
      status: "pending",
    });
    await ctx.scheduler.runAfter(0, internal.automation.dispatch, {
      loanId: id,
      event: "request_created",
    });
    return id;
  },
});

export const decide = mutation({
  args: {
    loanId: v.id("loans"),
    decision: v.union(v.literal("approve"), v.literal("decline")),
  },
  handler: async (ctx, { loanId, decision }) => {
    const user = await requireUser(ctx);
    const loan = await ctx.db.get(loanId);
    if (!loan) throw new ConvexError({ code: "NOT_FOUND" });
    assertOwner(user, loan.ownerId);
    if (loan.status !== "pending") throw new ConvexError({ code: "BAD_STATE" });

    if (decision === "approve") {
      if (loan.endDate < todayUTC()) throw new ConvexError({ code: "EXPIRED" });
      if (
        await hasOverlap(
          ctx,
          loan.toolId,
          loan.startDate,
          loan.endDate,
          loan._id
        )
      ) {
        throw new ConvexError({ code: "CONFLICT" });
      }
    }
    const status = decision === "approve" ? "approved" : "declined";
    await ctx.db.patch(loanId, { status });
    await ctx.scheduler.runAfter(0, internal.automation.dispatch, {
      loanId,
      event: status === "approved" ? "request_approved" : "request_declined",
    });
  },
});

export const markReturned = mutation({
  args: { loanId: v.id("loans") },
  handler: async (ctx, { loanId }) => {
    const user = await requireUser(ctx);
    const loan = await ctx.db.get(loanId);
    if (!loan) throw new ConvexError({ code: "NOT_FOUND" });
    if (user.role !== "admin") assertOwner(user, loan.ownerId); // the lender confirms the return
    if (loan.status !== "approved") {
      throw new ConvexError({ code: "BAD_STATE" });
    }
    await ctx.db.patch(loanId, { status: "returned", returnedAt: Date.now() });
    await ctx.scheduler.runAfter(0, internal.automation.dispatch, {
      loanId,
      event: "loan_returned",
    });
  },
});

export const cancel = mutation({
  args: { loanId: v.id("loans") },
  handler: async (ctx, { loanId }) => {
    const user = await requireUser(ctx);
    const loan = await ctx.db.get(loanId);
    if (!loan) throw new ConvexError({ code: "NOT_FOUND" });
    if (loan.borrowerId !== user._id) {
      throw new ConvexError({ code: "FORBIDDEN" });
    }
    if (loan.status !== "pending") {
      throw new ConvexError({ code: "BAD_STATE" });
    }
    await ctx.db.patch(loanId, { status: "cancelled" });
  },
});
