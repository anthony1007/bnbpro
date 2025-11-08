// src/app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

export async function GET(req: Request) {
  /**
   * Query params: limit, page
   */
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value ?? null;
    const auth = await verifyUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(auth.userId);

    const url = new URL(req.url);
    const limit = Math.min(200, Number(url.searchParams.get("limit") ?? 100));
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const skip = (page - 1) * limit;

    const txs = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    return NextResponse.json({ transactions: txs });
  } catch (err: any) {
    console.error("GET /api/transactions error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
