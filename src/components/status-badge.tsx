"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const tone = {
  pending: "bg-ember/15 text-ember",
  approved: "bg-moss/15 text-moss",
  overdue: "bg-danger/15 text-danger",
  returned: "bg-line/80 text-mute",
  declined: "bg-line/80 text-mute",
  cancelled: "bg-line/80 text-mute",
} as const;

export type LoanStatus = keyof typeof tone;

interface StatusBadgeProps {
  status: LoanStatus;
  overdue?: boolean;
}

export function StatusBadge({ status, overdue }: StatusBadgeProps) {
  const key: LoanStatus = overdue ? "overdue" : status;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={key}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors",
          tone[key]
        )}
        initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
        transition={{ duration: 0.18 }}
      >
        {key === "returned" && (
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M5 12.5l4.5 4.5L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            />
          </svg>
        )}
        {key}
      </motion.span>
    </AnimatePresence>
  );
}
