import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/security/api-key";

export const runtime = "nodejs";

const createStoreSchema = z.object({
    name: z.string().trim().min(1).max(100)
});

function generateApiKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "fv_live_";
    for (let i = 0; i < 32; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
        where: { userId },
        select: { id: true, name: true, apiKeyPrefix: true, allowedOrigins: true, plan: true, tryonsThisMonth: true }
    });

    return NextResponse.json({ data: store });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parsed = createStoreSchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const existing = await prisma.store.findFirst({ where: { userId } });
    if (existing) {
        return NextResponse.json({ error: "Store already exists" }, { status: 409 });
    }

    const rawKey = generateApiKey();
    const prefix = rawKey.slice(0, 10);
    const store = await prisma.store.create({
        data: {
            userId,
            name: parsed.data.name,
            apiKeyHash: hashApiKey(rawKey),
            apiKeyPrefix: prefix
        },
        select: { id: true, name: true, apiKeyPrefix: true }
    });

    await prisma.apiKeyAudit.create({
        data: { storeId: store.id, apiKeyPrefix: prefix }
    });

    return NextResponse.json({ data: { ...store, apiKey: rawKey } }, { status: 201 });
}
