import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password utils", () => {
  it("verifies bcrypt hash correctly", async () => {
    const hash = await hashPassword("StrongPass123!");
    await expect(verifyPassword("StrongPass123!", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });
});
