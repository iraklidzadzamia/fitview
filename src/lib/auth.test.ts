import { describe, expect, it } from "vitest";

import { authOptions } from "./auth";

describe("authOptions", () => {
  it("uses JWT sessions for credentials compatibility", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
  });
});
