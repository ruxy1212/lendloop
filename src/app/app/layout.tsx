"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
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
  useStoreUser();
  const path = usePathname();
  const me = useQuery(api.users.me);
  const incoming = useQuery(api.loans.incoming);
  const pendingCount =
    incoming?.filter((l) => l.status === "pending").length ?? 0;

  const tabs = [
    { href: "/app", label: "Board" },
    { href: "/app/listings", label: "My listings" },
    { href: "/app/requests", label: "My requests" },
    { href: "/app/incoming", label: "Incoming", badge: pendingCount },
    ...(me?.role === "admin"
      ? [{ href: "/app/admin", label: "Admin" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 pb-24">
        {/* Sticky App Header */}
        <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 bg-paper/85 px-4 sm:px-6 backdrop-blur-md border-b border-line/60">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2.5 outline-none"
            >
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
            <UserButton />
          </div>

          {/* Navigation Tabs with sliding underline */}
          <LayoutGroup id="nav">
            <nav
              aria-label="App Navigation"
              className="no-scrollbar -mb-px flex gap-1 overflow-x-auto"
            >
              {tabs.map((t) => {
                const active =
                  t.href === "/app" ? path === "/app" : path.startsWith(t.href);

                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={cn(
                      "relative flex shrink-0 items-center gap-1.5 px-3.5 py-3 text-sm font-medium transition-colors outline-none",
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
                        className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink"
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
