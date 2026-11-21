"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full transition-all duration-300",
        scrolled
          ? "bg-paper/85 py-3 shadow-xs backdrop-blur-md border-b border-line/60"
          : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 outline-none">
          <div className="relative size-8 overflow-hidden rounded-xl border border-line/80 bg-card p-1 shadow-xs transition group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="LendLoop logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-display text-2xl font-normal tracking-tight text-ink">
            LendLoop
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Unauthenticated>
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-primary-dark/90 px-4 text-sm font-medium text-white shadow-[0_8px_24px_rgba(19,27,255,0.18)] transition-colors hover:border-primary/40 hover:bg-primary-dark"
              >
                Sign in
              </motion.button>
            </SignInButton>
          </Unauthenticated>

          <Authenticated>
            <div className="flex items-center gap-4">
              <Link
                href="/app"
                className="inline-flex h-9 items-center rounded-full border border-white/10 bg-card/60 px-4 text-sm font-medium text-ink backdrop-blur-md transition hover:border-primary/40 hover:bg-primary-dark/20"
              >
                Explore tools →
              </Link>
              <UserButton />
            </div>
          </Authenticated>
        </div>
      </div>
    </header>
  );
}
