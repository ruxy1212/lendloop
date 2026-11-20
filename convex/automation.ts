import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";

export const eventV = v.union(
  v.literal("request_created"),
  v.literal("request_approved"),
  v.literal("request_declined"),
  v.literal("loan_returned")
);

const kindV = v.union(
  v.literal("request_notification"),
  v.literal("overdue_reminder")
);

const statusV = v.union(
  v.literal("sent"),
  v.literal("retrying"),
  v.literal("failed")
);

const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [0, 30_000, 120_000, 600_000, 1_800_000];

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** DATA MINIMIZATION: this is the entire payload n8n ever sees for a notification. */
export const buildPayload = internalQuery({
  args: { loanId: v.id("loans"), event: eventV },
  handler: async (ctx, { loanId, event }) => {
    const loan = await ctx.db.get(loanId);
    if (!loan) return null;
    const [tool, owner, borrower] = await Promise.all([
      ctx.db.get(loan.toolId),
      ctx.db.get(loan.ownerId),
      ctx.db.get(loan.borrowerId),
    ]);
    if (!tool || !owner || !borrower) return null;
    const toOwner = event === "request_created";
    const recipient = toOwner ? owner : borrower;
    const other = toOwner ? borrower : owner;
    if (!recipient.email) return null;
    return {
      eventId: `${loanId}:${event}`, // deterministic = idempotent
      event,
      recipient: { name: recipient.name, email: recipient.email },
      counterpartName: other.name,
      toolName: tool.name,
      startDate: loan.startDate,
      endDate: loan.endDate,
    };
  },
});

export const alreadySent = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, { key }): Promise<boolean> => {
    const e = await ctx.db
      .query("automationEvents")
      .withIndex("by_key", (q) => q.eq("idempotencyKey", key))
      .unique();
    return e?.status === "sent";
  },
});

/** Upsert by idempotency key. A "sent" record is never downgraded. Safe to call repeatedly. */
export const record = internalMutation({
  args: {
    loanId: v.id("loans"),
    kind: kindV,
    idempotencyKey: v.string(),
    status: statusV,
    attempts: v.optional(v.number()),
    detail: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const existing = await ctx.db
      .query("automationEvents")
      .withIndex("by_key", (q) => q.eq("idempotencyKey", a.idempotencyKey))
      .unique();
    const detail = a.detail?.slice(0, 200);
    if (existing) {
      if (existing.status === "sent") return { duplicate: true };
      await ctx.db.patch(existing._id, {
        status: a.status,
        detail,
        attempts: a.attempts ?? existing.attempts,
        updatedAt: Date.now(),
      });
      return { duplicate: false };
    }
    await ctx.db.insert("automationEvents", {
      loanId: a.loanId,
      kind: a.kind,
      idempotencyKey: a.idempotencyKey,
      status: a.status,
      attempts: a.attempts ?? 1,
      detail,
      updatedAt: Date.now(),
    });
    return { duplicate: false };
  },
});

export const dispatch = internalAction({
  args: {
    loanId: v.id("loans"),
    event: eventV,
    attempt: v.optional(v.number()),
  },
  handler: async (ctx, { loanId, event, attempt = 0 }): Promise<void> => {
    const payload = await ctx.runQuery(internal.automation.buildPayload, {
      loanId,
      event,
    });
    if (!payload) return;
    if (
      await ctx.runQuery(internal.automation.alreadySent, {
        key: payload.eventId,
      })
    ) {
      return;
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!webhookUrl || !webhookSecret) {
      await ctx.runMutation(internal.automation.record, {
        loanId,
        kind: "request_notification",
        idempotencyKey: payload.eventId,
        status: "retrying",
        attempts: attempt + 1,
        detail: "N8N_WEBHOOK_URL or N8N_WEBHOOK_SECRET not configured",
      });
      return;
    }

    const body = JSON.stringify(payload);
    const ts = Date.now().toString();
    const signature = await hmacHex(webhookSecret, `${ts}.${body}`);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-lendloop-timestamp": ts,
          "x-lendloop-signature": signature,
        },
        body,
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`n8n responded ${res.status}`);
      await ctx.runMutation(internal.automation.record, {
        loanId,
        kind: "request_notification",
        idempotencyKey: payload.eventId,
        status: "sent",
        attempts: attempt + 1,
      });
    } catch (e: unknown) {
      const next = attempt + 1;
      const final = next >= MAX_ATTEMPTS;
      const detail = e instanceof Error ? e.message : "unknown error";
      await ctx.runMutation(internal.automation.record, {
        loanId,
        kind: "request_notification",
        idempotencyKey: payload.eventId,
        status: final ? "failed" : "retrying",
        attempts: next,
        detail,
      });
      if (!final) {
        await ctx.scheduler.runAfter(
          BACKOFF_MS[next],
          internal.automation.dispatch,
          { loanId, event, attempt: next }
        );
      }
    } finally {
      clearTimeout(timer);
    }
  },
});

/** Used by the overdue endpoint: only loans that still need today's reminder. */
export const overdueLoans = internalQuery({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    const loans = await ctx.db
      .query("loans")
      .withIndex("by_status_end", (q) =>
        q.eq("status", "approved").lt("endDate", today)
      )
      .take(200);

    const out: {
      loanId: typeof loans[number]["_id"];
      reminderKey: string;
      toolName: string;
      borrowerName: string;
      borrowerEmail: string;
      endDate: string;
      daysOverdue: number;
    }[] = [];

    for (const l of loans) {
      const reminderKey = `${l._id}:reminder:${today}`;
      const done = await ctx.db
        .query("automationEvents")
        .withIndex("by_key", (q) => q.eq("idempotencyKey", reminderKey))
        .unique();
      if (done?.status === "sent") continue; // retries of the whole workflow never re-send

      const [tool, borrower] = await Promise.all([
        ctx.db.get(l.toolId),
        ctx.db.get(l.borrowerId),
      ]);
      if (!tool || !borrower?.email) continue;

      out.push({
        loanId: l._id,
        reminderKey,
        toolName: tool.name,
        borrowerName: borrower.name,
        borrowerEmail: borrower.email,
        endDate: l.endDate,
        daysOverdue: Math.round(
          (Date.parse(today) - Date.parse(l.endDate)) / 86_400_000
        ),
      });
    }
    return out;
  },
});
