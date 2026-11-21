"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { motion } from "motion/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { CategoryFilter } from "@/components/category-filter";
import { ToolGrid } from "@/components/tool-grid";
import { CardSkeleton } from "@/components/card-skeleton";

function EmptyState() {
  return (
    <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-card/50 py-16 text-center backdrop-blur-md">
      <p className="text-base font-medium text-ink">No tools listed yet</p>
      <p className="mt-1 text-sm text-mute">
        Be the first neighbor to share what you have.
      </p>
      <div className="mt-5">
        <Unauthenticated>
          <SignInButton mode="modal">
            <button
              type="button"
              className="h-10 rounded-full bg-ink px-5 text-sm font-medium text-paper transition hover:bg-ink/90 active:scale-95"
            >
              Sign in to list a tool
            </button>
          </SignInButton>
        </Unauthenticated>
        <Authenticated>
          <Link
            href="/app/listings"
            className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper transition hover:bg-ink/90 active:scale-95"
          >
            List a tool →
          </Link>
        </Authenticated>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [category, setCategory] = useState("all");
  const tools = useQuery(api.tools.publicList);

  const filteredTools = useMemo(() => {
    if (!tools) return [];
    if (category === "all") return tools;
    return tools.filter((t) => t.category === category);
  }, [tools, category]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 pb-24">
        {/* Hero Section */}
        <Hero />

        {/* Action Callout */}
        <div className="mt-5 mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-white/10 bg-card/55 p-2 backdrop-blur-md">
            <Unauthenticated>
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-11 rounded-xl bg-primary-dark px-5 text-sm font-medium text-white shadow-[0_12px_35px_rgba(19,27,255,0.22)] transition hover:bg-primary-dark/85"
                >
                  Sign in to explore
                </motion.button>
              </SignInButton>
            </Unauthenticated>

            <Authenticated>
              <Link
                href="/app"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-dark px-5 text-sm font-medium text-white shadow-[0_12px_35px_rgba(19,27,255,0.22)] transition hover:bg-primary-dark/85 active:scale-95"
              >
                Explore tools →
              </Link>
            </Authenticated>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mute sm:text-sm">
            <span>Free neighborhood sharing</span>
            <span className="size-1 rounded-full bg-primary" />
            <span>Verified members</span>
            <span className="size-1 rounded-full bg-primary" />
            <span>Zero platform fees</span>
          </div>
        </div>

        {/* Neighborhood Tools Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-line/60 pt-8">
          <div>
            <h2 className="font-display text-2xl text-ink">Neighborhood tools</h2>
            <p className="text-xs text-mute sm:text-sm">
              Tools currently available in your neighborhood
            </p>
          </div>

          <CategoryFilter
            id="public-filter"
            value={category}
            onChange={setCategory}
          />
        </div>

        {/* Grid / Skeletons / Empty */}
        {tools === undefined ? (
          <CardSkeleton
            isLoading
            count={6}
            cardHeight={144}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {null}
          </CardSkeleton>
        ) : filteredTools.length === 0 ? (
          <EmptyState />
        ) : (
          <ToolGrid
            items={filteredTools}
            render={(t) => (
              <div className="flex h-36 w-full flex-col justify-between rounded-2xl border border-card-border bg-card/60 p-5 backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:border-card-border-hover hover:shadow-[0_18px_45px_rgba(5,194,255,0.10)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-medium text-mute capitalize">
                    {t.category.replace("-", " ")}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-moss font-medium">
                    <span className="size-1.5 rounded-full bg-moss" />
                    Available
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-ink text-lg leading-snug line-clamp-1">
                    {t.name}
                  </h3>
                  <Unauthenticated>
                    <p className="mt-1 text-xs text-mute">
                      Sign in to borrow
                    </p>
                  </Unauthenticated>
                  <Authenticated>
                    <Link
                      href="/app"
                      className="mt-1 inline-flex text-xs font-medium text-primary transition hover:text-primary/80"
                    >
                      Explore or request →
                    </Link>
                  </Authenticated>
                </div>
              </div>
            )}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-line/60 py-8 bg-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6">
          <p className="text-xs text-mute">
            © LendLoop · Borrow what you need. Lend what you don’t.
          </p>
          <div className="flex items-center gap-6 text-xs text-mute">
            <span>Minimum data sharing</span>
            <span>Local trust</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
