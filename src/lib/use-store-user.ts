"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";

export function useStoreUser() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const store = useMutation(api.users.store);
  const storedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !userLoaded || storedRef.current) return;

    const email = user?.primaryEmailAddress?.emailAddress ?? "";
    const emailHandle = email.includes("@") ? email.split("@")[0] : "";
    const name = (
      user?.fullName?.trim() ||
      user?.firstName?.trim() ||
      user?.username?.trim() ||
      emailHandle ||
      "Neighbor"
    ).slice(0, 80);

    store({ name, email })
      .then(() => {
        storedRef.current = true;
      })
      .catch((err: unknown) => {
        console.error("Failed to sync profile:", err);
        toast.error("Could not sync your account profile. Please refresh.", {
          id: "sync-profile-error",
        });
      });
  }, [isAuthenticated, userLoaded, user, store]);

  return { isAuthenticated, isLoading: authLoading || !userLoaded };
}
