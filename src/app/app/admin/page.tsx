"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/convex/_generated/api";
import { StatusBadge, type LoanStatus } from "@/components/status-badge";
import { spring } from "@/lib/motion";
import { cn, fmtRange, toastError } from "@/lib/utils";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { CardSkeleton } from "@/components/card-skeleton";
import { Button } from "@/components/button";

type AdminTab = "loans" | "lenders";

export default function AdminPage() {
  const me = useQuery(api.users.me);
  const isAdmin = me?.role === "admin";

  const [activeTab, setActiveTab] = useState<AdminTab>("loans");
  const [togglingId, setTogglingId] = useState<Id<"users"> | null>(null);
  const [returningId, setReturningId] = useState<Id<"loans"> | null>(null);

  const allLoans = useQuery(api.admin.allLoans, isAdmin ? {} : "skip");
  const lenders = useQuery(api.admin.lenders, isAdmin ? {} : "skip");
  const setTrusted = useMutation(api.admin.setTrusted);
  const markReturned = useMutation(api.loans.markReturned);

  const handleMarkReturned = async (loanId: Id<"loans">) => {
    setReturningId(loanId);
    try {
      await markReturned({ loanId });
      toast.success("Loan marked as returned.");
    } catch (e) {
      toastError(e);
    } finally {
      setReturningId(null);
    }
  };

  const handleToggleTrusted = async (userId: Id<"users">, nextState: boolean) => {
    setTogglingId(userId);
    try {
      await setTrusted({ userId, trusted: nextState });
      toast.success(nextState ? "Marked as Trusted Lender." : "Removed trusted status.");
    } catch (e) {
      toastError(e);
    } finally {
      setTogglingId(null);
    }
  };

  if (me === undefined) {
    return (
      <CardSkeleton isLoading count={1} cardHeight={256} className="grid">
        {null}
      </CardSkeleton>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-card/50 py-20 text-center backdrop-blur-md">
        <div className="size-12 rounded-full bg-danger/10 flex items-center justify-center text-danger font-display text-xl mb-3">
          !
        </div>
        <h1 className="font-display text-2xl text-ink">Admin access restricted</h1>
        <p className="mt-1 text-sm text-mute max-w-sm">
          This section is reserved for neighborhood administrators to oversee community loans and trusted lenders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-line/60 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl text-ink">Admin console</h1>
            <span className="rounded-full bg-ember/15 px-2.5 py-0.5 text-xs font-semibold text-ember">
              Moderator
            </span>
          </div>
          <p className="mt-1 text-xs text-mute sm:text-sm">
            Neighborhood activity oversight and member moderation
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-2xl border border-white/10 bg-card/60 p-1 shadow-xs backdrop-blur-md">
          <Button
            variant={activeTab === "loans" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("loans")}
            className="sm:text-sm"
          >
            All loans {allLoans ? `(${allLoans.length})` : ""}
          </Button>
          <Button
            variant={activeTab === "lenders" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("lenders")}
            className="sm:text-sm"
          >
            Lenders directory {lenders ? `(${lenders.length})` : ""}
          </Button>
        </div>
      </div>

      {/* Tab 1: All Loans */}
      {activeTab === "loans" && (
        <div>
          {allLoans === undefined ? (
            <CardSkeleton isLoading count={4} cardHeight={80} className="space-y-3">
              {null}
            </CardSkeleton>
          ) : allLoans.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card/50 py-12 text-center backdrop-blur-md">
              <p className="text-sm font-medium text-mute">No loans recorded in the neighborhood yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence mode="popLayout">
                {allLoans.map((l) => (
                  <motion.li
                    key={l._id}
                    layout
                    transition={spring}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-card-border bg-card/60 p-4 shadow-xs backdrop-blur-md sm:p-5"
                  >
                    <div>
                      <h3 className="font-medium text-ink text-base">{l.toolName}</h3>
                      <p className="text-xs sm:text-sm text-mute">
                        Lender: <span className="font-medium text-ink">{l.owner}</span> · Borrower: <span className="font-medium text-ink">{l.borrower}</span>
                      </p>
                      <p className="text-xs text-mute mt-0.5">
                        {fmtRange(l.startDate, l.endDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={l.status as LoanStatus} />
                      {l.status === "approved" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={returningId === l._id}
                          onClick={() => handleMarkReturned(l._id)}
                        >
                          {returningId === l._id ? "Updating…" : "Mark returned"}
                        </Button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      )}

      {/* Tab 2: Lenders Directory */}
      {activeTab === "lenders" && (
        <div>
          {lenders === undefined ? (
            <CardSkeleton isLoading count={4} cardHeight={64} className="space-y-3">
              {null}
            </CardSkeleton>
          ) : lenders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card/50 py-12 text-center backdrop-blur-md">
              <p className="text-sm font-medium text-mute">No members registered yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence mode="popLayout">
                {lenders.map((u) => (
                  <motion.li
                    key={u._id}
                    layout
                    transition={spring}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-card-border bg-card/60 p-4 shadow-xs backdrop-blur-md sm:p-5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-ink text-base">{u.name}</h3>
                        {u.role === "admin" && (
                          <span className="rounded-full bg-ember/15 px-2 py-0.2 text-[10px] font-semibold text-ember">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-mute mt-0.5">
                        {u.trustedLender ? "✓ Verified Trusted Lender" : "Standard Neighbor"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-mute hidden sm:inline">
                        Trusted Lender
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        role="switch"
                        aria-checked={u.trustedLender}
                        disabled={togglingId === u._id}
                        onClick={() => handleToggleTrusted(u._id, !u.trustedLender)}
                        className={cn(
                          "h-7 w-12 items-center rounded-full p-1",
                          u.trustedLender ? "justify-end bg-moss" : "justify-start bg-line",
                          togglingId === u._id ? "opacity-50" : ""
                        )}
                      >
                        <motion.span
                          layout
                          transition={spring}
                          className="size-5 rounded-full bg-paper shadow-xs"
                        />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
