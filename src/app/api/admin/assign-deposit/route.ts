// src/app/api/admin/assign-deposit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const depositId = Number(body.depositId);
    const userId = Number(body.userId);
    if (!depositId || !userId) return NextResponse.json({ error: "Missing depositId or userId" }, { status: 400 });

    const deposit = await prisma.transaction.findUnique({ where: { id: depositId } });
    if (!deposit) return NextResponse.json({ error: "Deposit not found" }, { status: 404 });

    if (deposit.userId === userId) return NextResponse.json({ error: "Already assigned" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newBalance = (BigInt(user.balanceWei || "0") + BigInt(deposit.amountWei)).toString();
    await prisma.$transaction([
      prisma.transaction.update({ where: { id: depositId }, data: { userId } }),
      prisma.user.update({ where: { id: userId }, data: { balanceWei: newBalance } }),
    ]);

    return NextResponse.json({ success: true, newBalance });
  } catch (err: any) {
    console.error("assign-deposit error", err);
    return NextResponse.json({ error: "Server error", detail: String(err?.message || err) }, { status: 500 });
  }
}
