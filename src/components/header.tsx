"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/button";

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
          <Image
            src="/logo.png"
            alt="LendLoop logo"
            width={36}
            height={36}
            className="object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-display text-2xl font-normal tracking-tight text-ink">
            LendLoop
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Unauthenticated>
            <SignInButton mode="modal">
              <Button size="sm" className="border border-white/10">
                Sign in
              </Button>
            </SignInButton>
          </Unauthenticated>

          <Authenticated>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <Button href="/app" variant="secondary" size="sm" className="border-white/10 bg-card/60 backdrop-blur-md">
                  Explore tools →
                </Button>
              </motion.div>
              <UserButton />
            </div>
          </Authenticated>
        </div>
      </div>
    </header>
  );
}
