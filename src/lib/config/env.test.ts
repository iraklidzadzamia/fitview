import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const validEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/fitview",
  NEXTAUTH_SECRET: "secret",
  REDIS_URL: "redis://localhost:6379",
  REPLICATE_API_TOKEN: "r8_token",
  AWS_S3_BUCKET: "fitview-uploads",
  AWS_REGION: "us-east-1",
  AWS_ACCESS_KEY_ID: "key",
  AWS_SECRET_ACCESS_KEY: "secret-key"
} as const;

describe("parseEnv", () => {
  it("throws when required env vars are missing", () => {
    expect(() => parseEnv({} as NodeJS.ProcessEnv)).toThrowError(/NEXTAUTH_SECRET/);
  });

  it("parses all required runtime variables", () => {
    expect(parseEnv(validEnv as unknown as NodeJS.ProcessEnv)).toMatchObject(validEnv);
  });
});
