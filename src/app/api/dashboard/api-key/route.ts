import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/security/api-key";

export const runtime = "nodejs";

function generateApiKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "fv_live_";
    for (let i = 0; i < 32; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
}

// POST /api/dashboard/api-key — rotate (generate new) API key
export async function POST() {
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
        select: { id: true, apiKeyPrefix: true }
    });

    if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Revoke old key in audit log
    await prisma.apiKeyAudit.updateMany({
        where: { storeId: store.id, revokedAt: null },
        data: { revokedAt: new Date() }
    });

    const rawKey = generateApiKey();
    const prefix = rawKey.slice(0, 10);

    await prisma.store.update({
        where: { id: store.id },
        data: { apiKeyHash: hashApiKey(rawKey), apiKeyPrefix: prefix }
    });

    await prisma.apiKeyAudit.create({
        data: { storeId: store.id, apiKeyPrefix: prefix }
    });

    return NextResponse.json({ data: { apiKey: rawKey, apiKeyPrefix: prefix } }, { status: 201 });
}
