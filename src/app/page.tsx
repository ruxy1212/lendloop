"use client";

import { useMemo, useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { motion } from "motion/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { CategoryFilter } from "@/components/category-filter";
import { ToolGrid } from "@/components/tool-grid";
import { CardSkeleton } from "@/components/card-skeleton";
import { Button } from "@/components/button";

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
            <Button variant="ink">Sign in to list a tool</Button>
          </SignInButton>
        </Unauthenticated>
        <Authenticated>
          <Button href="/app/listings" variant="ink">
            List a tool →
          </Button>
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

        {/* Neighborhood Tools Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-line/60 pt-8">
          <div>
            <h2 className="font-display text-2xl text-ink">Tools to Borrow</h2>
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
                    <Button href="/app" variant="ghost" size="sm" className="mt-1 h-auto px-0 text-xs text-primary hover:bg-transparent hover:text-primary/80">
                      Explore or request →
                    </Button>
                  </Authenticated>
                </div>
              </div>
            )}
          />
        )}

        {/* Community CTA */}
        <section className="relative isolate mt-16 border-t border-line/60 pt-8">
          <div className="relative isolate overflow-hidden rounded-[28px] border border-primary/20 bg-[linear-gradient(135deg,#11165a_0%,#131bff_54%,#1a2a78_100%)] px-4 py-10 text-center shadow-[0_24px_70px_rgba(19,27,255,0.16)] sm:px-8 sm:py-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_15%,rgba(5,194,255,0.16),transparent_42%),radial-gradient(circle_at_82%_85%,rgba(99,91,255,0.24),transparent_38%)]"
            />

            <div className="flex justify-center">
              <Unauthenticated>
                <SignInButton mode="modal">
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Button
                      variant="ink"
                      size="lg"
                      className="h-14 min-w-52 rounded-full px-7 text-[15px]"
                    >
                      Sign in to lend or borrow
                    </Button>
                  </motion.div>
                </SignInButton>
              </Unauthenticated>

              <Authenticated>
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <Button
                    href="/app"
                    variant="ink"
                    size="lg"
                    className="h-14 min-w-52 rounded-full px-7 text-[15px]"
                  >
                    Explore tools →
                  </Button>
                </motion.div>
              </Authenticated>
            </div>

            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 divide-y divide-white/15 text-xs sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:text-sm">
              <div className="px-5 py-3 text-white/70 sm:py-0">
                Free neighborhood sharing
              </div>
              <div className="px-5 py-3 text-white/70 sm:py-0">
                Verified members
              </div>
              <div className="px-5 py-3 text-white/70 sm:py-0">
                Zero platform fees
              </div>
            </div>
          </div>
        </section>
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
