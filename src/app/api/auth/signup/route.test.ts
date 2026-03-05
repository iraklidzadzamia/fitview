import { afterEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock, createMock, hashPasswordMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  hashPasswordMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
      create: createMock
    }
  }
}));

vi.mock("@/lib/security/password", () => ({
  hashPassword: hashPasswordMock
}));

import { POST } from "./route";

describe("POST /api/auth/signup", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 409 when email is already in use", async () => {
    findUniqueMock.mockResolvedValue({ id: "user_existing" });

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "owner@store.com",
          password: "password123",
          name: "Store Owner"
        })
      })
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "Email already in use" });
  });

  it("creates user with hashed password", async () => {
    findUniqueMock.mockResolvedValue(null);
    hashPasswordMock.mockResolvedValue("hashed-password");
    createMock.mockResolvedValue({
      id: "user_1",
      email: "owner@store.com"
    });

    const response = await POST(
      new Request("http://localhost/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "Owner@Store.com",
          password: "password123",
          name: "Store Owner"
        })
      })
    );

    expect(hashPasswordMock).toHaveBeenCalledWith("password123");
    expect(createMock).toHaveBeenCalledWith({
      data: {
        email: "owner@store.com",
        name: "Store Owner",
        passwordHash: "hashed-password"
      },
      select: {
        id: true,
        email: true
      }
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      data: {
        id: "user_1",
        email: "owner@store.com"
      }
    });
  });
});
