import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/security/password";

export const runtime = "nodejs";

const signupSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(100).optional()
});

export async function POST(request: Request) {
  try {
    const jsonPayload = await request.json().catch(() => null);
    const parsedPayload = signupSchema.safeParse(jsonPayload);

    if (!parsedPayload.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsedPayload.data.email },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsedPayload.data.password);
    const user = await prisma.user.create({
      data: {
        email: parsedPayload.data.email,
        name: parsedPayload.data.name ?? null,
        passwordHash
      },
      select: {
        id: true,
        email: true
      }
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("Signup failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
