import { Queue } from "bullmq";

import { getBullMqConnection } from "@/lib/queue/connection";
import type { TryOnJobData } from "@/lib/queue/payload";

export const TRY_ON_QUEUE_NAME = "tryon";
export const TRY_ON_JOB_NAME = "process-tryon";

export function createTryOnQueue() {
  return new Queue<TryOnJobData>(TRY_ON_QUEUE_NAME, {
    connection: getBullMqConnection()
  });
}

export const tryOnQueue = createTryOnQueue();
