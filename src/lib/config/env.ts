import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1)
});

export function parseEnv(input: NodeJS.ProcessEnv) {
  return envSchema.parse(input);
}
