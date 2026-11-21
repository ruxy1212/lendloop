"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoanRow } from "@/components/loan-row";
import { AnimatePresence } from "motion/react";
import { CardSkeleton } from "@/components/card-skeleton";
import { Button } from "@/components/button";

export default function IncomingRequestsPage() {
  const me = useQuery(api.users.me);
  const incoming = useQuery(api.loans.incoming, me ? {} : "skip");

  const { pendingLoans, activeAndPastLoans } = useMemo(() => {
    if (!incoming) return { pendingLoans: [], activeAndPastLoans: [] };
    const pending = incoming.filter((l) => l.status === "pending");
    const others = incoming.filter((l) => l.status !== "pending");
    return { pendingLoans: pending, activeAndPastLoans: others };
  }, [incoming]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-line/60 pb-5">
        <h1 className="font-display text-3xl text-ink">Incoming requests</h1>
        <p className="mt-1 text-xs text-mute sm:text-sm">
          Borrowing requests and active loans for your listed tools
        </p>
      </div>

      {incoming === undefined ? (
        <CardSkeleton
          isLoading
          count={3}
          cardHeight={96}
          className="space-y-3"
        >
          {null}
        </CardSkeleton>
      ) : incoming.length === 0 ? (
        <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-card/50 py-16 text-center backdrop-blur-md">
          <p className="text-base font-medium text-ink">
            No incoming requests yet
          </p>
          <p className="mt-1 text-sm text-mute">
            When neighbors request to borrow your tools, you can review and
            approve them here.
          </p>
          <Button href="/app/listings" className="mt-5 hover:text-purple-500! border border-transparent hover:border-white">
            Manage your listings →
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Action Needed */}
          {pendingLoans.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-medium text-ink uppercase tracking-wider text-[11px]">
                  Pending Approval ({pendingLoans.length})
                </h2>
                <span className="size-2 rounded-full bg-ember" />
              </div>
              <ul className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {pendingLoans.map((loan) => (
                    <LoanRow key={loan._id} loan={loan} role="owner" />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}

          {/* Active & Historical Loans */}
          {activeAndPastLoans.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-medium text-mute uppercase tracking-wider text-[11px]">
                Active & Returned Loans
              </h2>
              <ul className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {activeAndPastLoans.map((loan) => (
                    <LoanRow key={loan._id} loan={loan} role="owner" />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
