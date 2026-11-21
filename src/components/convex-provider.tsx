"use client";

import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { ProgressProvider } from "@bprogress/next/app";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProgressProvider
      height="4px"
      color="#2563eb"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster position="bottom-center" />
        </MotionConfig>
      </ConvexProviderWithClerk>
    </ProgressProvider>
  );
}
