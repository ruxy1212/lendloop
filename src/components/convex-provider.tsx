"use client";

import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster position="bottom-center" />
      </MotionConfig>
    </ConvexProviderWithClerk>
  );
}
