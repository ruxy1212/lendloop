"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoanRow } from "@/components/loan-row";
import { AnimatePresence } from "motion/react";
import { CardSkeleton } from "@/components/card-skeleton";
import { Button } from "@/components/button";

export default function MyRequestsPage() {
  const me = useQuery(api.users.me);
  const requests = useQuery(api.loans.mine, me ? {} : "skip");

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
        <CardSkeleton
          isLoading
          count={3}
          cardHeight={96}
          className="space-y-3"
        >
          {null}
        </CardSkeleton>
      ) : requests.length === 0 ? (
        <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-card/50 py-16 text-center backdrop-blur-md">
          <p className="text-base font-medium text-ink">No requests made yet</p>
          <p className="mt-1 text-sm text-mute">
            Explore neighborhood tools and borrow what you need.
          </p>
          <Button href="/app" className="mt-5">
            Explore tools →
          </Button>
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
