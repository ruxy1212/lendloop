"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ease } from "@/lib/motion";
import pattern from "@/app/pattern.svg";

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
    <section className="relative isolate overflow-x-clip flex min-h-svh flex-col justify-center py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[28%] -top-16 -z-10 h-72 w-xl max-w-[90vw] rounded-full bg-[radial-gradient(circle,rgba(19,27,255,0.32),rgba(99,91,255,0.12)_42%,transparent_70%)] blur-2xl"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-6 z-[-5] aspect-1556/533 w-full overflow-hidden"
        initial={reduceMotion ? false : { opacity: 1 }}
        animate={{ opacity: reduceMotion ? 0.55 : 0.55 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.5, ease, delay: 1.5 }
        }
      >
        <Image
          src={pattern}
          alt=""
          fill
          unoptimized
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-6 z-[-4] aspect-1556/533 w-full bg-[linear-gradient(to_bottom,rgba(1,1,12,0.05),rgba(1,1,12,0.72)_65%,rgba(1,1,12,0.96))]"
        initial={reduceMotion ? false : { opacity: 0.15 }}
        animate={{ opacity: reduceMotion ? 0.72 : 0.72 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.5, ease, delay: 1.5 }
        }
      />
      <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:col-span-8 lg:items-start lg:text-left">
          <h1 className="max-w-6xl font-display text-[clamp(3.25rem,8.5vw,7.5rem)] leading-[0.88] tracking-[-0.035em] text-ink">
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

        <motion.div
          className="order-1 mx-auto w-full max-w-72 lg:order-2 lg:col-span-4 lg:max-w-none"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.7, ease, delay: 0.25 }
          }
        >
          <motion.div
            aria-label="LendLoop logo"
            className="relative isolate w-full overflow-hidden rounded-[82px] p-1.5 shadow-[0_24px_70px_rgba(19,27,255,0.18)]"
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_210deg,#ff2a5f_245deg,#ff9f1c_270deg,#ffeb3b_295deg,#00d68f_315deg,#05c2ff_335deg,#a855f7_360deg)]"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 2.2, ease: "linear", repeat: Infinity }
              }
            />
            <div className="relative flex aspect-square w-full items-center justify-center rounded-[82px] bg-card/95 backdrop-blur-md">
              <div className="relative w-full h-full">
                <Image
                  src="/logo.png"
                  alt="LendLoop"
                  fill
                  unoptimized
                  priority
                  sizes="(max-width: 1024px) 144px, 160px"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
