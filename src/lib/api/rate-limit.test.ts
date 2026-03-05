import { describe, expect, it } from "vitest";

import { createInMemoryRateLimiter } from "./rate-limit";

describe("rate limiter", () => {
  it("blocks requests after limit is exceeded", () => {
    const limiter = createInMemoryRateLimiter({ limit: 2, windowMs: 60_000 });
    expect(limiter.consume("store_1:ip_1").allowed).toBe(true);
    expect(limiter.consume("store_1:ip_1").allowed).toBe(true);
    expect(limiter.consume("store_1:ip_1").allowed).toBe(false);
  });
});
