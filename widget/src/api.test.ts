import { afterEach, describe, expect, it, vi } from "vitest";

import { getPollDelayMs, pollTryOnUntilSettled } from "./api";

describe("getPollDelayMs", () => {
  it("uses retry-after header when present", () => {
    expect(getPollDelayMs("2")).toBe(2000);
    expect(getPollDelayMs(null)).toBe(2000);
  });
});

describe("pollTryOnUntilSettled", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns timeout error when max attempts are exhausted", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              id: "tr_1",
              status: "PROCESSING",
              retryAfterSec: 2
            }
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "2"
            }
          }
        )
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await pollTryOnUntilSettled({
      apiBase: "https://app.fitview.ai/api/public",
      apiKey: "fv_live_test",
      pollUrl: "/tryon/tr_1",
      maxAttempts: 1
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ error: "Request timed out, please try again" });
  });
});
