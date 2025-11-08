// src/app/api/funds/list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const funds = await prisma.fund.findMany({
      orderBy: { createdAt: "desc" },
      include: { image: true },
    });

    return NextResponse.json({ ok: true, funds });
  } catch (err: any) {
    console.error("GET /api/funds/list error:", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
