"use client";

import { motion } from "motion/react";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { StatusBadge, type LoanStatus } from "./status-badge";
import { spring } from "@/lib/motion";
import { ago, fmtRange, toastError } from "@/lib/utils";

export type LoanItem = FunctionReturnType<typeof api.loans.incoming>[number];

function Activity({ a }: { a: LoanItem["activity"] }) {
  if (!a) return null;
  const label = a.kind === "overdue_reminder" ? "Reminder sent" : "Notified";
  const text =
    a.status === "sent"
      ? `${label} ${ago(a.at)}`
      : a.status === "retrying"
      ? "Delivery retrying"
      : "Delivery failed";
  const dot =
    a.status === "sent"
      ? "bg-moss"
      : a.status === "retrying"
      ? "bg-ember"
      : "bg-danger";

  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs text-mute">
      <span className={`size-1.5 rounded-full ${dot}`} />
      <span>{text}</span>
    </p>
  );
}

export function LoanRow({
  loan,
  role,
}: {
  loan: LoanItem;
  role: "owner" | "borrower";
}) {
  const decide = useMutation(api.loans.decide).withOptimisticUpdate(
    (store, { loanId, decision }) => {
      const cur = store.getQuery(api.loans.incoming, {});
      if (!cur) return;
      store.setQuery(
        api.loans.incoming,
        {},
        cur.map((l) =>
          l._id === loanId
            ? {
                ...l,
                status:
                  decision === "approve"
                    ? ("approved" as const)
                    : ("declined" as const),
              }
            : l
        )
      );
    }
  );

  const markReturned = useMutation(api.loans.markReturned);
  const cancel = useMutation(api.loans.cancel);

  const run = (p: Promise<unknown>, ok: string) =>
    p.then(() => toast.success(ok)).catch(toastError);

  const btn = "h-9 rounded-xl px-3 text-xs sm:text-sm font-medium transition active:scale-95";

  return (
    <motion.li
      layout
      transition={spring}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border bg-card/60 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.10)] backdrop-blur-md sm:p-5"
    >
      <div>
        <h3 className="font-medium text-ink text-base">{loan.toolName}</h3>
        <p className="text-xs sm:text-sm text-mute">
          {loan.counterpart} · {fmtRange(loan.startDate, loan.endDate)}
        </p>
        <Activity a={loan.activity} />
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge
          status={loan.status as LoanStatus}
          overdue={loan.overdue}
        />

        {role === "owner" && loan.status === "pending" && (
          <>
            <button
              type="button"
              className={`${btn} bg-primary-dark text-white shadow-[0_8px_24px_rgba(19,27,255,0.18)] hover:bg-primary-dark/85`}
              onClick={() =>
                run(
                  decide({ loanId: loan._id, decision: "approve" }),
                  "Approved."
                )
              }
            >
              Approve
            </button>
            <button
              type="button"
              className={`${btn} border border-line hover:bg-paper`}
              onClick={() =>
                run(
                  decide({ loanId: loan._id, decision: "decline" }),
                  "Declined."
                )
              }
            >
              Decline
            </button>
          </>
        )}

        {role === "owner" && loan.status === "approved" && (
          <button
            type="button"
            className={`${btn} border border-line hover:bg-paper`}
            onClick={() =>
              run(markReturned({ loanId: loan._id }), "Marked returned.")
            }
          >
            Mark returned
          </button>
        )}

        {role === "borrower" && loan.status === "pending" && (
          <button
            type="button"
            className={`${btn} border border-line hover:bg-paper text-mute hover:text-ink`}
            onClick={() => run(cancel({ loanId: loan._id }), "Cancelled.")}
          >
            Cancel
          </button>
        )}
      </div>
    </motion.li>
  );
}
