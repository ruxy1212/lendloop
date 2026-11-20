import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { categoryV, conditionV } from "./constants";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(), // server-side only; never returned to clients
    role: v.union(v.literal("admin"), v.literal("user")),
    trustedLender: v.boolean(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  tools: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    category: categoryV,
    condition: conditionV,
    description: v.string(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_category", ["category"]),

  loans: defineTable({
    toolId: v.id("tools"),
    ownerId: v.id("users"), // denormalized for indexed "incoming" lookups
    borrowerId: v.id("users"),
    startDate: v.string(), // "YYYY-MM-DD"
    endDate: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
      v.literal("returned"),
      v.literal("cancelled")
    ),
    returnedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_borrower", ["borrowerId"])
    .index("by_borrower_tool_status", ["borrowerId", "toolId", "status"])
    .index("by_tool_status", ["toolId", "status"])
    .index("by_status_end", ["status", "endDate"]),

  automationEvents: defineTable({
    loanId: v.id("loans"),
    kind: v.union(
      v.literal("request_notification"),
      v.literal("overdue_reminder")
    ),
    idempotencyKey: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("retrying"),
      v.literal("failed")
    ),
    attempts: v.number(),
    detail: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_key", ["idempotencyKey"])
    .index("by_loan", ["loanId"]),
});
