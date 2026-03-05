import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  REDIS_URL: z.string().min(1),
  REPLICATE_API_TOKEN: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1)
});

export function parseEnv(input: NodeJS.ProcessEnv) {
  return envSchema.parse(input);
}
