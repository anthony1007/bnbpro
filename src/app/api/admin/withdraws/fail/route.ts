// src/app/api/admin/withdraws/fail/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTokenFromCookie } from "@/lib/verify";
import { Prisma } from "@prisma/client";

function isAdmin(payload: { id: string; role?: string } | null) {
  return payload && payload.role === "ADMIN";
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value ?? null;
    const userPayload = await verifyTokenFromCookie(token);
    const userRole = userPayload ? {id: userPayload.id.toString(), role: userPayload.role} : null;
    if (!isAdmin(userRole)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { withdrawId } = await req.json();
    if (!withdrawId) return NextResponse.json({ error: "Missing withdrawId" }, { status: 400 });

    const w = await prisma.transaction.findUnique({ where: { id: Number(withdrawId) } });
    if (!w) return NextResponse.json({ error: "Withdraw not found" }, { status: 404 });

    if (w.status === "SUCCESS") return NextResponse.json({ error: "Already completed" }, { status: 400 });

    // Refund + update status atomically
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Refund balance to user
      const user = await tx.user.findUnique({ where: { id: w.userId } });
      const old = BigInt(user?.balanceWei ?? "0");
      await tx.user.update({
        where: { id: w.userId },
        data: { balanceWei: (old + BigInt(w.amountWei)).toString() },
      });

      await tx.transaction.update({
        where: { id: w.id },
        data: { status: "FAILED", createdAt: new Date() },
      });
    });

    return NextResponse.json({ success: true, message: "Withdraw failed and refunded" });
  } catch (err: any) {
    console.error("POST /api/admin/withdraws/fail error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
