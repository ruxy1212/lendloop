"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { LayoutGroup, motion } from "motion/react";
import { api } from "@/convex/_generated/api";
import { useStoreUser } from "@/lib/use-store-user";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading: isAuthLoading } = useStoreUser();
  const path = usePathname();
  const me = useQuery(api.users.me);
  const incoming = useQuery(api.loans.incoming, me ? {} : "skip");
  const pendingCount =
    incoming?.filter((l) => l.status === "pending").length ?? 0;

  const tabs = [
    { href: "/app", label: "Explore tools" },
    { href: "/app/listings", label: "My listings" },
    { href: "/app/requests", label: "My requests" },
    { href: "/app/incoming", label: "Incoming", badge: pendingCount },
    ...(me?.role === "admin"
      ? [{ href: "/app/admin", label: "Admin" }]
      : []),
  ];

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#0a0d3a]/60 p-8 backdrop-blur-xl shadow-2xl">
          <Image
            src="/logo.png"
            alt="LendLoop logo"
            width={48}
            height={48}
            className="mx-auto mb-4 object-contain"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-mute mb-6">
            Please sign in to access the neighborhood lending board, manage your listings, and view loan requests.
          </p>
          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full rounded-full bg-[#131bff] hover:bg-[#182799] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              Sign in to LendLoop
            </button>
          </SignInButton>
          <div className="mt-4">
            <Link
              href="/"
              className="text-xs text-mute hover:text-white transition-colors cursor-pointer"
            >
              ← Back to public catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 pb-24">
        {/* Sticky App Header */}
        <header className="sticky top-0 z-30 -mx-4 border-b border-white/8 bg-paper/75 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2.5 outline-none cursor-pointer"
            >
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
            <UserButton />
          </div>

          {/* Navigation Tabs with sliding underline */}
          <LayoutGroup id="nav">
            <nav
              aria-label="App Navigation"
              className="no-scrollbar -mb-px flex gap-1.5 overflow-x-auto"
            >
              {tabs.map((t) => {
                const active =
                  t.href === "/app" ? path === "/app" : path.startsWith(t.href);

                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={cn(
                      "relative flex shrink-0 items-center gap-1.5 rounded-t-xl px-3.5 py-3 text-sm font-medium transition-colors outline-none cursor-pointer",
                      active ? "text-ink" : "text-mute hover:text-ink"
                    )}
                  >
                    <span>{t.label}</span>
                    {!!t.badge && t.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={spring}
                        className="rounded-full bg-ember px-1.5 py-0.2 text-[10px] font-semibold text-white leading-tight"
                      >
                        {t.badge}
                      </motion.span>
                    )}
                    {active && (
                      <motion.span
                        layoutId="tab-underline"
                        transition={spring}
                        className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary shadow-[0_0_10px_rgba(5,194,255,0.8)]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>
        </header>

        {/* Main Routed Content */}
        <main className="pt-8">{children}</main>
      </div>
    </div>
  );
}
