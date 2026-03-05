import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a healthy status payload", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-05T00:00:00.000Z"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({
      data: {
        status: "ok",
        service: "fitview-api",
        timestamp: "2026-03-05T00:00:00.000Z"
      }
    });
  });
});
