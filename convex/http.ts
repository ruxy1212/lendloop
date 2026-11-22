import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return d === 0;
}

const authorized = (req: Request): boolean => {
  const secret = process.env.AUTOMATION_API_KEY || process.env.AUTOMATION_BEARER_TOKEN;
  if (!secret) return false;
  const authHeader = req.headers.get("authorization") ?? "";
  return safeEqual(authHeader, `Bearer ${secret}`);
};

http.route({
  path: "/automation/overdue",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    if (!authorized(req)) return new Response("Unauthorized", { status: 401 });
    const today = new URL(req.url).searchParams.get("today") ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
      return new Response("Bad request", { status: 400 });
    }
    const loans = await ctx.runQuery(internal.automation.overdueLoans, { today });
    return Response.json({ loans });
  }),
});

http.route({
  path: "/automation/reminder-result",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (!authorized(req)) return new Response("Unauthorized", { status: 401 });

    let rawJson: unknown;
    try {
      rawJson = await req.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const body =
      typeof rawJson === "object" && rawJson !== null
        ? (rawJson as Record<string, unknown>)
        : null;

    if (!body) return new Response("Bad request", { status: 400 });

    const loanId = typeof body.loanId === "string" ? body.loanId : "";
    const idempotencyKey =
      typeof body.idempotencyKey === "string" ? body.idempotencyKey : "";
    const status =
      body.status === "sent" || body.status === "failed" ? body.status : null;
    const detail = typeof body.detail === "string" ? body.detail : undefined;

    const okKey =
      Boolean(loanId) &&
      Boolean(idempotencyKey) &&
      idempotencyKey.startsWith(`${loanId}:reminder:`) &&
      /^\d{4}-\d{2}-\d{2}$/.test(idempotencyKey.slice(-10));

    if (!okKey || !status) {
      return new Response("Bad request", { status: 400 });
    }

    try {
      const r = await ctx.runMutation(internal.automation.record, {
        loanId: loanId as Id<"loans">,
        kind: "overdue_reminder",
        idempotencyKey,
        status,
        detail,
      });
      return Response.json({ ok: true, duplicate: r.duplicate }); // retries get 200, not 409
    } catch {
      return new Response("Bad request", { status: 400 }); // e.g. invalid loan id
    }
  }),
});

export default http;
