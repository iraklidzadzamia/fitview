import { describe, expect, it } from "vitest";

import { tryOnJobSchema } from "./payload";

describe("tryOnJobSchema", () => {
  it("validates required fields", () => {
    const parsed = tryOnJobSchema.parse({
      tryonId: "tr_1",
      storeId: "st_1",
      personImageUrl: "https://example.com/person.jpg",
      garmentImageUrl: "https://example.com/garment.jpg",
      category: "upper_body"
    });

    expect(parsed.tryonId).toBe("tr_1");
  });
});
