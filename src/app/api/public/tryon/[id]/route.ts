import { NextRequest, NextResponse } from "next/server";

import { POLL_RETRY_AFTER_SECONDS, mapTryonStatusResponse } from "@/lib/api/public-tryon";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/security/api-key";

export const runtime = "nodejs";

const POLL_HEADERS = {
  "Retry-After": String(POLL_RETRY_AFTER_SECONDS),
  "Cache-Control": "no-store"
};

async function findStoreIdByApiKey(request: NextRequest): Promise<string | null> {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return null;
  }

  const store = await prisma.store.findUnique({
    where: { apiKeyHash: hashApiKey(apiKey) },
    select: { id: true }
  });

  return store?.id ?? null;
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const storeId = await findStoreIdByApiKey(request);
    if (!storeId) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: POLL_HEADERS });
    }

    const tryOnRecord = await prisma.tryOn.findFirst({
      where: {
        id: context.params.id,
        storeId
      },
      select: {
        id: true,
        status: true,
        resultImageUrl: true,
        resultExpiresAt: true,
        error: true
      }
    });

    if (!tryOnRecord) {
      return NextResponse.json({ error: "Try-on not found" }, { status: 404, headers: POLL_HEADERS });
    }

    const mappedResponse = mapTryonStatusResponse(tryOnRecord);
    return NextResponse.json(mappedResponse.body, {
      status: mappedResponse.statusCode,
      headers: POLL_HEADERS
    });
  } catch (error) {
    console.error("Failed to fetch try-on status", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: POLL_HEADERS });
  }
}
