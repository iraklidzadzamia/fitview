import { describe, expect, it } from "vitest";

import { getPollDelayMs } from "./api";

describe("getPollDelayMs", () => {
  it("uses retry-after header when present", () => {
    expect(getPollDelayMs("2")).toBe(2000);
    expect(getPollDelayMs(null)).toBe(2000);
  });
});
