// src/app/api/withdraws/list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

export async function GET(req: Request) {
  try {
    const auth = await verifyUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(auth.userId);
    const txns = await prisma.transaction.findMany({
      where: { userId, type: "Withdraw" },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ withdraws: txns });
  } catch (err: any) {
    console.error("GET /api/withdraws/list error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
