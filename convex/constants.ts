import { v } from "convex/values";

export const CATEGORIES = [
  "power-tools",
  "garden",
  "kitchen",
  "camping",
  "cleaning",
  "other",
] as const;

export const CONDITIONS = ["like-new", "good", "worn"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Condition = (typeof CONDITIONS)[number];

// Validators are written out explicitly so Convex infers precise literal types.
export const categoryV = v.union(
  v.literal("power-tools"),
  v.literal("garden"),
  v.literal("kitchen"),
  v.literal("camping"),
  v.literal("cleaning"),
  v.literal("other")
);

export const conditionV = v.union(
  v.literal("like-new"),
  v.literal("good"),
  v.literal("worn")
);
