// src/app/api/admin/withdraws/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

function isAdmin(payload: { id: string; role?: string } | null) {
  return payload && payload.role === "ADMIN";
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value ?? null;
    const userPayload = await verifyUser();
    const userRole = userPayload ? {id: userPayload.userId.toString(), role: userPayload.role} : null;
    if (!isAdmin(userRole)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { withdrawId, txHash } = await req.json();
    if (!withdrawId || !txHash) return NextResponse.json({ error: "Missing withdrawId or txHash" }, { status: 400 });

    const w = await prisma.transaction.findUnique({ where: { id: Number(withdrawId) } });
    if (!w) return NextResponse.json({ error: "Withdraw not found" }, { status: 404 });

    if (w.status === "SUCCESS") return NextResponse.json({ error: "Already completed" }, { status: 400 });

    await prisma.transaction.update({
      where: { id: w.id },
      data: {
        txHash: String(txHash),
        status: "SUCCESS",
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Withdraw marked COMPLETED" });
  } catch (err: any) {
    console.error("POST /api/admin/withdraws/complete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
