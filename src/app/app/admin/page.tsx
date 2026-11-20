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

type AdminTab = "loans" | "lenders";

export default function AdminPage() {
  const me = useQuery(api.users.me);
  const isAdmin = me?.role === "admin";

  const [activeTab, setActiveTab] = useState<AdminTab>("loans");
  const [togglingId, setTogglingId] = useState<Id<"users"> | null>(null);

  const allLoans = useQuery(api.admin.allLoans, isAdmin ? {} : "skip");
  const lenders = useQuery(api.admin.lenders, isAdmin ? {} : "skip");
  const setTrusted = useMutation(api.admin.setTrusted);

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
      <div className="space-y-4">
        <div className="h-10 w-48 rounded-xl bg-line/60 animate-pulse" />
        <div className="h-64 rounded-2xl border border-line bg-card p-6 animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-card/40 py-20 text-center">
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
        <div className="inline-flex rounded-2xl border border-line bg-card p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("loans")}
            className={cn(
              "rounded-xl px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors outline-none",
              activeTab === "loans"
                ? "bg-ink text-paper"
                : "text-mute hover:text-ink"
            )}
          >
            All loans {allLoans ? `(${allLoans.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lenders")}
            className={cn(
              "rounded-xl px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors outline-none",
              activeTab === "lenders"
                ? "bg-ink text-paper"
                : "text-mute hover:text-ink"
            )}
          >
            Lenders directory {lenders ? `(${lenders.length})` : ""}
          </button>
        </div>
      </div>

      {/* Tab 1: All Loans */}
      {activeTab === "loans" && (
        <div>
          {allLoans === undefined ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl border border-line bg-card p-4 animate-pulse"
                />
              ))}
            </div>
          ) : allLoans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-card/40 py-12 text-center">
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
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-xs"
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

                    <StatusBadge status={l.status as LoanStatus} />
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
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-2xl border border-line bg-card p-4 animate-pulse"
                />
              ))}
            </div>
          ) : lenders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-card/40 py-12 text-center">
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
                    className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-xs"
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
                      <button
                        type="button"
                        role="switch"
                        aria-checked={u.trustedLender}
                        disabled={togglingId === u._id}
                        onClick={() => handleToggleTrusted(u._id, !u.trustedLender)}
                        className={cn(
                          "flex h-7 w-12 items-center rounded-full p-1 transition-colors outline-none",
                          u.trustedLender ? "justify-end bg-moss" : "justify-start bg-line",
                          togglingId === u._id ? "opacity-50" : ""
                        )}
                      >
                        <motion.span
                          layout
                          transition={spring}
                          className="size-5 rounded-full bg-paper shadow-xs"
                        />
                      </button>
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
