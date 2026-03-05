import crypto from "node:crypto";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { optimizeInputImage } from "@/lib/images/optimize";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/security/api-key";
import { uploadToS3 } from "@/lib/storage/s3";
import {
  INPUT_PHOTO_TTL_MS,
  MAX_UPLOAD_BYTES,
  POLL_RETRY_AFTER_SECONDS,
  UsageLimitReachedError,
  isOriginAllowed,
  mapCatalogCategoryToTryOnCategory,
  reserveTryOnUsageSlot
} from "@/lib/api/public-tryon";
import { publicTryOnRateLimiter } from "@/lib/api/rate-limit";
import { TRY_ON_JOB_NAME, tryOnQueue } from "@/lib/queue/tryon-queue";

export const runtime = "nodejs";

const requestBodySchema = z.object({
  catalogItemId: z.string().min(1)
});

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

async function findStoreByApiKey(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return null;
  }

  const apiKeyHash = hashApiKey(apiKey);

  return prisma.store.findUnique({
    where: { apiKeyHash },
    select: {
      id: true,
      plan: true,
      allowedOrigins: true
    }
  });
}

async function parseTryOnRequest(request: NextRequest) {
  const formData = await request.formData();
  const personPhotoValue = formData.get("person_photo");
  const catalogItemId = formData.get("catalog_item_id");

  const parsedFields = requestBodySchema.safeParse({
    catalogItemId
  });

  if (!parsedFields.success) {
    return { error: "Invalid request body" } as const;
  }

  if (!(personPhotoValue instanceof File)) {
    return { error: "Missing person_photo file" } as const;
  }

  if (personPhotoValue.size <= 0 || personPhotoValue.size > MAX_UPLOAD_BYTES) {
    return { error: "Invalid file size" } as const;
  }

  return {
    data: {
      personPhoto: personPhotoValue,
      catalogItemId: parsedFields.data.catalogItemId
    }
  } as const;
}

export async function POST(request: NextRequest) {
  try {
    // 1) API key hash lookup
    const store = await findStoreByApiKey(request);
    if (!store) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // 2) Rate limit (storeId + IP)
    const rateLimitKey = `${store.id}:${getClientIp(request)}`;
    const rateResult = publicTryOnRateLimiter.consume(rateLimitKey);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateResult.retryAfterSec)
          }
        }
      );
    }

    // 3) Monthly reset (UTC) + atomic increment
    try {
      await reserveTryOnUsageSlot(store.id, store.plan);
    } catch (error) {
      if (error instanceof UsageLimitReachedError) {
        return NextResponse.json({ error: "Monthly try-on limit reached" }, { status: 429 });
      }
      throw error;
    }

    // 4) Exact CORS origin match
    const requestOrigin = request.headers.get("origin");
    if (!isOriginAllowed(store.allowedOrigins, requestOrigin)) {
      return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
    }

    // 5) Zod + file constraints
    const parsedRequest = await parseTryOnRequest(request);
    if ("error" in parsedRequest) {
      return NextResponse.json({ error: parsedRequest.error }, { status: 400 });
    }

    const photoArrayBuffer = await parsedRequest.data.personPhoto.arrayBuffer();
    const personPhotoBuffer = Buffer.from(photoArrayBuffer);

    let optimizedPhoto;
    try {
      optimizedPhoto = await optimizeInputImage(
        personPhotoBuffer,
        parsedRequest.data.personPhoto.type || "application/octet-stream"
      );
    } catch {
      return NextResponse.json({ error: "Unsupported image file" }, { status: 400 });
    }

    const personPhotoUrl = await uploadToS3(
      optimizedPhoto.buffer,
      `uploads/${store.id}/${Date.now()}-${crypto.randomUUID()}.jpg`,
      {
        contentType: optimizedPhoto.contentType,
        cacheControl: "private, max-age=86400"
      }
    );

    const catalogItem = await prisma.catalogItem.findFirst({
      where: {
        id: parsedRequest.data.catalogItemId,
        storeId: store.id,
        active: true
      },
      select: {
        id: true,
        category: true,
        imageUrl: true,
        processedUrl: true
      }
    });

    if (!catalogItem) {
      return NextResponse.json({ error: "Catalog item not found" }, { status: 404 });
    }

    const tryOnRecord = await prisma.tryOn.create({
      data: {
        storeId: store.id,
        userPhotoUrl: personPhotoUrl,
        userPhotoExpiresAt: new Date(Date.now() + INPUT_PHOTO_TTL_MS),
        catalogItemId: catalogItem.id,
        status: "PENDING"
      }
    });

    await tryOnQueue.add(
      TRY_ON_JOB_NAME,
      {
        tryonId: tryOnRecord.id,
        storeId: store.id,
        personImageUrl: personPhotoUrl,
        garmentImageUrl: catalogItem.processedUrl ?? catalogItem.imageUrl,
        category: mapCatalogCategoryToTryOnCategory(catalogItem.category)
      },
      {
        jobId: tryOnRecord.id,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2_000
        },
        removeOnComplete: 1_000,
        removeOnFail: 5_000
      }
    );

    return NextResponse.json(
      {
        data: {
          id: tryOnRecord.id,
          status: tryOnRecord.status,
          pollUrl: `/api/public/tryon/${tryOnRecord.id}`,
          retryAfterSec: POLL_RETRY_AFTER_SECONDS
        }
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Failed to create try-on request", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
