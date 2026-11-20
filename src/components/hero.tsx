"use client";

import { motion } from "motion/react";
import { ease } from "@/lib/motion";

const words = [
  "Borrow",
  "what",
  "you",
  "need.",
  "Lend",
  "what",
  "you",
  "don’t.",
];

export function Hero() {
  return (
    <div className="relative pt-6 pb-4 sm:pt-10">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-12 size-56 sm:size-72 md:size-96 opacity-70"
        viewBox="0 0 100 100"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--ember)"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 1.6, ease, delay: 0.2 }}
        />
      </svg>
      <h1 className="relative font-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] tracking-tight text-ink">
        {words.map((w, i) => (
          <span
            key={i}
            className="mr-[0.22em] inline-block overflow-hidden pb-[0.14em] align-bottom"
          >
            <motion.span
              className="inline-block"
              initial={{ y: "115%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.04 * i }}
            >
              {w}
            </motion.span>
          </span>
        ))}
      </h1>
      <p className="mt-4 max-w-lg text-base text-mute sm:text-lg">
        A neighborhood tool-lending circle. Share utility, reduce waste, and build community trust.
      </p>
    </div>
  );
}
