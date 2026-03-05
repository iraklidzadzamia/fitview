import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("throws when required env vars are missing", () => {
    expect(() => parseEnv({} as NodeJS.ProcessEnv)).toThrowError(/DATABASE_URL/);
  });
});
