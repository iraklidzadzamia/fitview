import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      data: {
        status: "ok",
        service: "fitview-api",
        timestamp: new Date().toISOString()
      }
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
