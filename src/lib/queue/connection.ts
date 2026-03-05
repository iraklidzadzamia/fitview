import type { ConnectionOptions } from "bullmq";

export function getBullMqConnection(): ConnectionOptions {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("Missing required environment variable: REDIS_URL");
  }

  const parsedUrl = new URL(redisUrl);
  const port = parsedUrl.port ? Number(parsedUrl.port) : 6379;
  const db = parsedUrl.pathname?.replace("/", "");
  const dbNumber = db ? Number(db) : undefined;

  return {
    host: parsedUrl.hostname,
    port,
    username: parsedUrl.username || undefined,
    password: parsedUrl.password || undefined,
    db: Number.isFinite(dbNumber) ? dbNumber : undefined,
    tls: parsedUrl.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  };
}
