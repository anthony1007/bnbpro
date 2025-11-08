// src/app/api/images/list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { id: "desc" },
      take: 100,
    });
    return NextResponse.json({ ok: true, images });
  } catch (err) {
    console.error("GET /api/images/list", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
