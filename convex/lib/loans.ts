import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

type DbCtx = QueryCtx | MutationCtx;

export const todayUTC = (): string => new Date().toISOString().slice(0, 10);

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function validateRange(start: string, end: string): void {
  if (
    !ISO.test(start) ||
    !ISO.test(end) ||
    isNaN(Date.parse(start)) ||
    isNaN(Date.parse(end))
  ) {
    throw new ConvexError({ code: "BAD_DATES" });
  }

  if (start < todayUTC() || end < start) {
    throw new ConvexError({ code: "BAD_DATES" });
  }

  if ((Date.parse(end) - Date.parse(start)) / 86_400_000 > 30) {
    throw new ConvexError({ code: "TOO_LONG" });
  }
}

export async function hasOverlap(
  ctx: DbCtx,
  toolId: Id<"tools">,
  start: string,
  end: string,
  exclude?: Id<"loans">
): Promise<boolean> {
  const approved = await ctx.db
    .query("loans")
    .withIndex("by_tool_status", (q) =>
      q.eq("toolId", toolId).eq("status", "approved")
    )
    .collect();

  return approved.some(
    (l) => l._id !== exclude && l.startDate <= end && start <= l.endDate
  );
}

// "On loan" = an approved, unreturned loan that has started (includes overdue).
export async function isOnLoan(
  ctx: DbCtx,
  toolId: Id<"tools">,
  today: string = todayUTC()
): Promise<boolean> {
  const approved = await ctx.db
    .query("loans")
    .withIndex("by_tool_status", (q) =>
      q.eq("toolId", toolId).eq("status", "approved")
    )
    .collect();

  return approved.some((l) => l.startDate <= today);
}
