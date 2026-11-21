"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";

export function useStoreUser() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const store = useMutation(api.users.store);
  const storedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || storedRef.current) return;
    store()
      .then(() => {
        storedRef.current = true;
      })
      .catch((err: unknown) => {
        console.error("Failed to sync profile:", err);
        toast.error("Could not sync your account profile. Please refresh.", {
          id: "sync-profile-error",
        });
      });
  }, [isAuthenticated, store]);

  return { isAuthenticated, isLoading };
}
