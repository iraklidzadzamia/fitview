import { describe, expect, it } from "vitest";

import { mapTryonStatusResponse } from "./public-tryon";

describe("mapTryonStatusResponse", () => {
  it("returns retryAfterSec for non-terminal status", () => {
    const result = mapTryonStatusResponse({
      id: "tr_1",
      status: "PROCESSING",
      resultImageUrl: null,
      resultExpiresAt: null,
      error: null
    });

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({
      data: {
        id: "tr_1",
        status: "PROCESSING",
        retryAfterSec: 2
      }
    });
  });
});
