import { describe, expect, it } from "vitest";
import { hashApiKey } from "./api-key";

describe("hashApiKey", () => {
  it("returns deterministic sha256 hash", () => {
    const hash1 = hashApiKey("fv_live_test123");
    const hash2 = hashApiKey("fv_live_test123");
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });
});
