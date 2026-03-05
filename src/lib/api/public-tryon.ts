import type { Category, Plan, TryOnStatus } from "@prisma/client";

import { planLimit, getMonthStartUtc } from "@/lib/billing/usage";
import { prisma } from "@/lib/prisma";
import type { TryOnCategory } from "@/lib/queue/payload";

export const POLL_RETRY_AFTER_SECONDS = 2;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const INPUT_PHOTO_TTL_MS = 24 * 60 * 60 * 1000;

type ApiSuccess<T> = { data: T };
type ApiFailure = { error: string };

type TryOnStatusRecord = {
  id: string;
  status: TryOnStatus;
  resultImageUrl: string | null;
  resultExpiresAt: Date | null;
  error: string | null;
};

type MappedTryOnResponse = {
  statusCode: number;
  body: ApiSuccess<Record<string, unknown>> | ApiFailure;
};

export class UsageLimitReachedError extends Error {
  constructor(message = "Monthly try-on limit reached") {
    super(message);
    this.name = "UsageLimitReachedError";
  }
}

export function normalizeOrigin(originValue: string): string | null {
  try {
    return new URL(originValue).origin.toLowerCase();
  } catch {
    return null;
  }
}

export function isOriginAllowed(allowedOrigins: string[], requestOriginHeader: string | null): boolean {
  if (allowedOrigins.length === 0) {
    return true;
  }

  if (!requestOriginHeader) {
    return false;
  }

  const requestOrigin = normalizeOrigin(requestOriginHeader);
  if (!requestOrigin) {
    return false;
  }

  const normalizedAllowedOrigins = allowedOrigins
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));

  return normalizedAllowedOrigins.includes(requestOrigin);
}

export function mapCatalogCategoryToTryOnCategory(category: Category): TryOnCategory {
  if (category === "BOTTOM") {
    return "lower_body";
  }

  if (category === "DRESS") {
    return "dresses";
  }

  return "upper_body";
}

export function mapTryonStatusResponse(
  record: TryOnStatusRecord,
  now: Date = new Date()
): MappedTryOnResponse {
  if (record.status === "PENDING" || record.status === "PROCESSING") {
    return {
      statusCode: 200,
      body: {
        data: {
          id: record.id,
          status: record.status,
          retryAfterSec: POLL_RETRY_AFTER_SECONDS
        }
      }
    };
  }

  if (record.status === "FAILED") {
    return {
      statusCode: 200,
      body: {
        data: {
          id: record.id,
          status: record.status,
          errorMessage: record.error ?? "Try-on failed. Please retry.",
          canRetry: true
        }
      }
    };
  }

  if (record.resultExpiresAt && record.resultExpiresAt.getTime() <= now.getTime()) {
    return {
      statusCode: 410,
      body: { error: "Result expired" }
    };
  }

  return {
    statusCode: 200,
    body: {
      data: {
        id: record.id,
        status: record.status,
        resultImageUrl: record.resultImageUrl,
        resultExpiresAt: record.resultExpiresAt?.toISOString() ?? null
      }
    }
  };
}

export async function reserveTryOnUsageSlot(storeId: string, plan: Plan, now: Date = new Date()) {
  const monthStartUtc = getMonthStartUtc(now);

  await prisma.$transaction(async (tx) => {
    await tx.store.updateMany({
      where: {
        id: storeId,
        monthResetAt: { lt: monthStartUtc }
      },
      data: {
        tryonsThisMonth: 0,
        monthResetAt: monthStartUtc
      }
    });

    if (plan === "ENTERPRISE") {
      await tx.store.update({
        where: { id: storeId },
        data: {
          tryonsThisMonth: { increment: 1 }
        }
      });
      return;
    }

    const limit = planLimit(plan);
    const incrementResult = await tx.store.updateMany({
      where: {
        id: storeId,
        tryonsThisMonth: { lt: limit }
      },
      data: {
        tryonsThisMonth: { increment: 1 }
      }
    });

    if (incrementResult.count === 0) {
      throw new UsageLimitReachedError();
    }
  });
}
