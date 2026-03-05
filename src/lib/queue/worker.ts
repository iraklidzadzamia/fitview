import { Worker } from "bullmq";

import { prisma } from "@/lib/prisma";
import { runVirtualTryOn } from "@/lib/ai/replicate";
import { getBullMqConnection } from "@/lib/queue/connection";
import { TRY_ON_QUEUE_NAME } from "@/lib/queue/tryon-queue";
import { tryOnJobSchema, type TryOnJobData } from "@/lib/queue/payload";
import { uploadToS3 } from "@/lib/storage/s3";

const WORKER_CONCURRENCY = 5;
const RESULT_TTL_DAYS = 7;

function buildResultExpiryDate() {
  return new Date(Date.now() + RESULT_TTL_DAYS * 24 * 60 * 60 * 1000);
}

async function downloadResultImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType
  };
}

export async function processTryOnJob(jobData: TryOnJobData): Promise<void> {
  const payload = tryOnJobSchema.parse(jobData);

  await prisma.tryOn.update({
    where: { id: payload.tryonId },
    data: { status: "PROCESSING" }
  });

  const startedAt = Date.now();

  try {
    const generatedImageUrl = await runVirtualTryOn({
      personImageUrl: payload.personImageUrl,
      garmentImageUrl: payload.garmentImageUrl,
      category: payload.category
    });

    const downloadedResult = await downloadResultImage(generatedImageUrl);
    const storedResultUrl = await uploadToS3(
      downloadedResult.buffer,
      `results/${payload.tryonId}.jpg`,
      {
        contentType: downloadedResult.contentType,
        cacheControl: "public, max-age=604800, immutable"
      }
    );

    await prisma.tryOn.update({
      where: { id: payload.tryonId },
      data: {
        status: "COMPLETED",
        resultImageUrl: storedResultUrl,
        resultExpiresAt: buildResultExpiryDate(),
        processingTime: Date.now() - startedAt,
        completedAt: new Date()
      }
    });
  } catch (error) {
    await prisma.tryOn.update({
      where: { id: payload.tryonId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    });
    throw error;
  }
}

export function createTryOnWorker() {
  return new Worker<TryOnJobData>(
    TRY_ON_QUEUE_NAME,
    async (job) => {
      await processTryOnJob(job.data);
    },
    {
      connection: getBullMqConnection(),
      concurrency: WORKER_CONCURRENCY
    }
  );
}
