"use client";

import { motion, useReducedMotion } from "motion/react";
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
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate pt-8 pb-5 sm:pt-14 sm:pb-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[28%] top-[-4rem] -z-10 h-72 w-[36rem] max-w-[90vw] rounded-full bg-[radial-gradient(circle,rgba(19,27,255,0.32),rgba(99,91,255,0.12)_42%,transparent_70%)] blur-2xl"
      />
      <h1 className="relative max-w-6xl font-display text-[clamp(3.25rem,8.5vw,7.5rem)] leading-[0.88] tracking-[-0.035em] text-ink">
        {words.map((w, i) => (
          <span
            key={i}
            className="mr-[0.18em] inline-block overflow-hidden pb-[0.12em] align-bottom"
          >
            <motion.span
              className={[
                "inline-block",
                w === "Borrow" || w === "Lend"
                  ? "bg-[linear-gradient(90deg,#05c2ff_0%,#3f65ff_48%,#9e78ff_100%)] bg-clip-text text-transparent"
                  : "",
              ].join(" ")}
              initial={reduceMotion ? false : { y: "115%" }}
              animate={{ y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.7, ease, delay: 0.04 * i }
              }
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
