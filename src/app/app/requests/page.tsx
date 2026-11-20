"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoanRow } from "@/components/loan-row";
import { AnimatePresence } from "motion/react";

export default function MyRequestsPage() {
  const requests = useQuery(api.loans.mine);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-line/60 pb-5">
        <h1 className="font-display text-3xl text-ink">My requests</h1>
        <p className="mt-1 text-xs text-mute sm:text-sm">
          Tools you have requested or borrowed from neighbors
        </p>
      </div>

      {/* Requests List */}
      {requests === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-line bg-card p-5 animate-pulse"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-card/40 py-16 text-center">
          <p className="text-base font-medium text-ink">No requests made yet</p>
          <p className="mt-1 text-sm text-mute">
            Explore the neighborhood board and borrow what you need.
          </p>
          <Link
            href="/app"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper transition hover:bg-ink/90 active:scale-95"
          >
            Browse the board →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence mode="popLayout">
            {requests.map((loan) => (
              <LoanRow key={loan._id} loan={loan} role="borrower" />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
