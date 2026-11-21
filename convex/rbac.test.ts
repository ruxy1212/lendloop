import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api, internal } from "./_generated/api";

const modules = import.meta.glob("./**/*.*s");

function createTest() {
  return convexTest(schema, modules);
}

function getFutureDates(startOffsetDays: number, durationDays: number) {
  const now = new Date();
  const start = new Date(now.getTime() + startOffsetDays * 86_400_000);
  const end = new Date(start.getTime() + (durationDays - 1) * 86_400_000);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

describe("LendLoop RBAC and Security Invariants", () => {
  it("Test 1: Signed-out tools.publicList returns only {_id, name, category}", async () => {
    const t = createTest();

    // Seed a user and tools
    const userA = t.withIdentity({
      tokenIdentifier: "user_a",
      name: "Alice",
      email: "alice@example.com",
    });
    await userA.mutation(api.users.store, {});

    await userA.mutation(api.tools.create, {
      name: "Cordless Drill",
      category: "power-tools",
      condition: "like-new",
      description: "Super powerful 18V drill with battery.",
    });

    // Unauthenticated caller
    const publicTools = await t.query(api.tools.publicList, {});
    expect(publicTools.length).toBe(1);
    const item = publicTools[0];

    // Must have _id, name, category
    expect(item).toHaveProperty("_id");
    expect(item.name).toBe("Cordless Drill");
    expect(item.category).toBe("power-tools");

    // Must NOT leak ownerId, description, or sensitive identity fields
    expect(item).not.toHaveProperty("ownerId");
    expect(item).not.toHaveProperty("description");
    expect(item).not.toHaveProperty("email");
  });

  it("Test 2: Signed-out call to protected functions throws UNAUTHENTICATED", async () => {
    const t = createTest();

    await expect(t.query(api.tools.board, {})).rejects.toThrowError(
      expect.objectContaining({ data: { code: "UNAUTHENTICATED" } })
    );

    await expect(t.query(api.tools.mine, {})).rejects.toThrowError(
      expect.objectContaining({ data: { code: "UNAUTHENTICATED" } })
    );

    await expect(t.query(api.loans.mine, {})).rejects.toThrowError(
      expect.objectContaining({ data: { code: "UNAUTHENTICATED" } })
    );
  });

  it("Test 3: User B cannot update or remove User A's tool (FORBIDDEN)", async () => {
    const t = createTest();

    const userA = t.withIdentity({
      tokenIdentifier: "user_a",
      name: "Alice",
      email: "alice@example.com",
    });
    await userA.mutation(api.users.store, {});

    const userB = t.withIdentity({
      tokenIdentifier: "user_b",
      name: "Bob",
      email: "bob@example.com",
    });
    await userB.mutation(api.users.store, {});

    const toolId = await userA.mutation(api.tools.create, {
      name: "Lawn Mower",
      category: "garden",
      condition: "good",
      description: "Electric mower.",
    });

    // User B tries to update
    await expect(
      userB.mutation(api.tools.update, {
        toolId,
        name: "Hacked Mower",
        category: "garden",
        condition: "worn",
        description: "Hacked",
      })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "FORBIDDEN" } })
    );

    // User B tries to remove
    await expect(
      userB.mutation(api.tools.remove, { toolId })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "FORBIDDEN" } })
    );
  });

  it("Test 4: User B cannot decide or markReturned on A's loan (FORBIDDEN)", async () => {
    const t = createTest();

    const userA = t.withIdentity({
      tokenIdentifier: "user_a",
      name: "Alice",
      email: "alice@example.com",
    });
    await userA.mutation(api.users.store, {});

    const userB = t.withIdentity({
      tokenIdentifier: "user_b",
      name: "Bob",
      email: "bob@example.com",
    });
    await userB.mutation(api.users.store, {});

    const toolId = await userA.mutation(api.tools.create, {
      name: "Camping Tent",
      category: "camping",
      condition: "good",
      description: "4-person waterproof tent.",
    });

    const { startDate, endDate } = getFutureDates(2, 3);
    const loanId = await userB.mutation(api.loans.request, {
      toolId,
      startDate,
      endDate,
    });

    // Borrower Bob tries to approve his own request
    await expect(
      userB.mutation(api.loans.decide, {
        loanId,
        decision: "approve",
      })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "FORBIDDEN" } })
    );

    // Alice approves
    await userA.mutation(api.loans.decide, {
      loanId,
      decision: "approve",
    });

    // Borrower Bob tries to mark it returned (only lender or admin can)
    await expect(
      userB.mutation(api.loans.markReturned, { loanId })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "FORBIDDEN" } })
    );
  });

  it("Test 5: Non-admin User cannot call admin queries or mutations (FORBIDDEN)", async () => {
    const t = createTest();

    const normalUser = t.withIdentity({
      tokenIdentifier: "user_normal",
      name: "Normal User",
      email: "normal@example.com",
    });
    const userId = await normalUser.mutation(api.users.store, {});

    await expect(normalUser.query(api.admin.allLoans, {})).rejects.toThrowError(
      expect.objectContaining({ data: { code: "FORBIDDEN" } })
    );

    await expect(normalUser.query(api.admin.lenders, {})).rejects.toThrowError(
      expect.objectContaining({ data: { code: "FORBIDDEN" } })
    );

    await expect(
      normalUser.mutation(api.admin.setTrusted, { userId, trusted: true })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "FORBIDDEN" } })
    );
  });

  it("Test 6: Admin can remove any tool and setTrusted", async () => {
    const t = createTest();

    const userA = t.withIdentity({
      tokenIdentifier: "user_a",
      name: "Alice",
      email: "alice@example.com",
    });
    const userAId = await userA.mutation(api.users.store, {});

    const adminUser = t.withIdentity({
      tokenIdentifier: "admin_user",
      name: "Admin Alice",
      email: "admin@example.com",
    });
    await adminUser.mutation(api.users.store, {});

    // Promote adminUser to admin role
    await t.mutation(internal.users.setRole, {
      email: "admin@example.com",
      role: "admin",
    });

    // Admin sets trusted lender for user A
    await adminUser.mutation(api.admin.setTrusted, {
      userId: userAId,
      trusted: true,
    });

    const lenders = await adminUser.query(api.admin.lenders, {});
    const updatedA = lenders.find((u) => u._id === userAId);
    expect(updatedA?.trustedLender).toBe(true);

    // User A creates a tool
    const toolId = await userA.mutation(api.tools.create, {
      name: "Pressure Washer",
      category: "cleaning",
      condition: "good",
      description: "Clean driveway easily.",
    });

    // Admin removes user A's tool
    await adminUser.mutation(api.tools.remove, { toolId });
    const mine = await userA.query(api.tools.mine, {});
    expect(mine.length).toBe(0);
  });

  it("Test 7: Loan validation invariants (own tool, past dates, >30 days, conflict)", async () => {
    const t = createTest();

    const userA = t.withIdentity({
      tokenIdentifier: "user_a",
      name: "Alice",
      email: "alice@example.com",
    });
    await userA.mutation(api.users.store, {});

    const userB = t.withIdentity({
      tokenIdentifier: "user_b",
      name: "Bob",
      email: "bob@example.com",
    });
    await userB.mutation(api.users.store, {});

    const toolId = await userA.mutation(api.tools.create, {
      name: "Blender",
      category: "kitchen",
      condition: "like-new",
      description: "High speed smoothie blender.",
    });

    // 1. Cannot request own tool
    const valid = getFutureDates(2, 3);
    await expect(
      userA.mutation(api.loans.request, { toolId, ...valid })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "OWN_TOOL" } })
    );

    // 2. Past dates rejected
    await expect(
      userB.mutation(api.loans.request, {
        toolId,
        startDate: "2020-01-01",
        endDate: "2020-01-05",
      })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "BAD_DATES" } })
    );

    // 3. End before start rejected
    await expect(
      userB.mutation(api.loans.request, {
        toolId,
        startDate: valid.endDate,
        endDate: valid.startDate,
      })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "BAD_DATES" } })
    );

    // 4. > 30 days rejected
    const tooLong = getFutureDates(2, 35);
    await expect(
      userB.mutation(api.loans.request, { toolId, ...tooLong })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "TOO_LONG" } })
    );

    // 5. Approved overlap conflict
    const booked = getFutureDates(10, 5); // day 10 to 14
    const loanId = await userB.mutation(api.loans.request, {
      toolId,
      ...booked,
    });
    await userA.mutation(api.loans.decide, { loanId, decision: "approve" });

    const userC = t.withIdentity({
      tokenIdentifier: "user_c",
      name: "Charlie",
      email: "charlie@example.com",
    });
    await userC.mutation(api.users.store, {});

    // Overlapping request (day 12 to 16)
    const overlap = getFutureDates(12, 5);
    await expect(
      userC.mutation(api.loans.request, { toolId, ...overlap })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "CONFLICT" } })
    );
  });

  it("Test 8: Pending requests reserve dates and cancellation releases them", async () => {
    const t = createTest();

    const userA = t.withIdentity({
      tokenIdentifier: "pending_owner",
      name: "Owner",
      email: "owner@example.com",
    });
    await userA.mutation(api.users.store, {});

    const userB = t.withIdentity({
      tokenIdentifier: "pending_borrower",
      name: "Borrower",
      email: "borrower@example.com",
    });
    await userB.mutation(api.users.store, {});

    const userC = t.withIdentity({
      tokenIdentifier: "pending_other",
      name: "Other Borrower",
      email: "other@example.com",
    });
    await userC.mutation(api.users.store, {});

    const toolId = await userA.mutation(api.tools.create, {
      name: "Tile Cutter",
      category: "power-tools",
      condition: "good",
      description: "Wet tile cutter.",
    });

    const dates = getFutureDates(10, 5);
    const loanId = await userB.mutation(api.loans.request, {
      toolId,
      ...dates,
    });

    await expect(
      userC.mutation(api.loans.request, {
        toolId,
        startDate: getFutureDates(12, 3).startDate,
        endDate: getFutureDates(12, 3).endDate,
      })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "CONFLICT" } })
    );

    const board = await userC.query(api.tools.board, {});
    const card = board.find((item) => item._id === toolId);
    expect(card?.requestedByMe).toBe(false);

    await userB.mutation(api.loans.cancel, { loanId });

    await userC.mutation(api.loans.request, {
      toolId,
      startDate: getFutureDates(12, 3).startDate,
      endDate: getFutureDates(12, 3).endDate,
    });

    const borrowerBoard = await userB.query(api.tools.board, {});
    expect(borrowerBoard.find((item) => item._id === toolId)?.requestedByMe).toBe(false);
  });

  it("Test 9: Owner decline releases pending dates", async () => {
    const t = createTest();

    const userA = t.withIdentity({
      tokenIdentifier: "decline_owner",
      name: "Owner",
      email: "decline-owner@example.com",
    });
    await userA.mutation(api.users.store, {});

    const userB = t.withIdentity({
      tokenIdentifier: "decline_borrower",
      name: "Borrower",
      email: "decline-borrower@example.com",
    });
    await userB.mutation(api.users.store, {});

    const toolId = await userA.mutation(api.tools.create, {
      name: "Pressure Washer",
      category: "garden",
      condition: "good",
      description: "Electric pressure washer.",
    });

    const dates = getFutureDates(20, 4);
    const loanId = await userB.mutation(api.loans.request, {
      toolId,
      ...dates,
    });
    await userA.mutation(api.loans.decide, {
      loanId,
      decision: "decline",
    });

    await userB.mutation(api.loans.request, {
      toolId,
      ...dates,
    });
  });

  it("Test 10: Double approval throws BAD_STATE", async () => {
    const t = createTest();

    const userA = t.withIdentity({
      tokenIdentifier: "user_a",
      name: "Alice",
      email: "alice@example.com",
    });
    await userA.mutation(api.users.store, {});

    const userB = t.withIdentity({
      tokenIdentifier: "user_b",
      name: "Bob",
      email: "bob@example.com",
    });
    await userB.mutation(api.users.store, {});

    const toolId = await userA.mutation(api.tools.create, {
      name: "Waffle Maker",
      category: "kitchen",
      condition: "good",
      description: "Belgian waffle maker.",
    });

    const dates = getFutureDates(3, 2);
    const loanId = await userB.mutation(api.loans.request, { toolId, ...dates });

    // First approval succeeds
    await userA.mutation(api.loans.decide, { loanId, decision: "approve" });

    // Second approval fails with BAD_STATE
    await expect(
      userA.mutation(api.loans.decide, { loanId, decision: "approve" })
    ).rejects.toThrowError(
      expect.objectContaining({ data: { code: "BAD_STATE" } })
    );
  });
});
