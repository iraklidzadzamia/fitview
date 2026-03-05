import { describe, expect, it } from "vitest";

import { getMonthStartUtc, needsMonthlyReset, planLimit } from "./usage";

describe("usage reset logic", () => {
  it("detects reset when store monthResetAt is before current month UTC", () => {
    const now = new Date("2026-03-05T10:00:00.000Z");
    const oldReset = new Date("2026-02-01T00:00:00.000Z");

    expect(needsMonthlyReset(oldReset, now)).toBe(true);
    expect(getMonthStartUtc(now).toISOString()).toBe("2026-03-01T00:00:00.000Z");
  });

  it("returns plan limits", () => {
    expect(planLimit("STARTER")).toBe(500);
    expect(planLimit("PRO")).toBe(3000);
    expect(planLimit("ENTERPRISE")).toBe(Number.POSITIVE_INFINITY);
  });
});
