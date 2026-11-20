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

function Skeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-32 flex-col justify-between rounded-2xl border border-line/60 bg-card p-5 animate-pulse"
        >
          <div className="h-4 w-20 rounded-full bg-line/60" />
          <div className="space-y-2">
            <div className="h-5 w-3/4 rounded-md bg-line/80" />
            <div className="h-3 w-1/3 rounded-md bg-line/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-card/50 py-16 text-center">
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 pb-24">
        {/* Hero Section */}
        <Hero />

        {/* Action Callout */}
        <div className="mt-6 mb-12 flex flex-wrap items-center gap-4">
          <Unauthenticated>
            <SignInButton mode="modal">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="h-12 rounded-full bg-ink px-6 text-sm font-medium text-paper shadow-xs transition hover:bg-ink/90"
              >
                Sign in to lend or borrow
              </motion.button>
            </SignInButton>
          </Unauthenticated>

          <Authenticated>
            <Link
              href="/app"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper transition hover:bg-ink/90 active:scale-95"
            >
              Open the board →
            </Link>
          </Authenticated>

          <p className="text-xs text-mute sm:text-sm">
            Free neighborhood sharing · Verified members · Zero platform fees
          </p>
        </div>

        {/* Public Board Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-line/60 pt-8">
          <div>
            <h2 className="font-display text-2xl text-ink">Public catalog</h2>
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
          <Skeletons count={6} />
        ) : filteredTools.length === 0 ? (
          <EmptyState />
        ) : (
          <ToolGrid
            items={filteredTools}
            render={(t) => (
              <div className="flex h-36 w-full flex-col justify-between rounded-2xl border border-line bg-card p-5 transition-shadow hover:shadow-xs">
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
                  <p className="mt-1 text-xs text-mute">
                    Sign in to check condition & borrow
                  </p>
                </div>
              </div>
            )}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-line/60 py-8 bg-paper">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <p className="text-xs text-mute">
            © {new Date().getFullYear()} LendLoop · Borrow what you need. Lend what you don’t.
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
