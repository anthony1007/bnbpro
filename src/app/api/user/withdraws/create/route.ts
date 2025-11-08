// src/app/api/withdraws/create/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseEther, isAddress } from "ethers";
import { verifyUser } from "@/lib/verify";

export async function POST(req: Request) {
  try {
    const auth = await verifyUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(auth.userId);

    const { amount, recipient, tokenSymbol } = await req.json();
    if (!amount || !recipient) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (!isAddress(recipient)) return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });

    let amountWei: bigint;
    try {
      amountWei = parseEther(String(amount));
    } catch {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const bal = BigInt(user.balanceWei ?? "0");
    if (bal < amountWei) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

    // Deduct + create transaction
    const tx = await prisma.$transaction(async (txn) => {
      await txn.user.update({ where: { id: userId }, data: { balanceWei: (bal - amountWei).toString() } });
      const created = await txn.transaction.create({
        data: {
          userId,
          type: "Withdraw",
          amountWei: amountWei.toString(),
          tokenSymbol: tokenSymbol ?? "ETH",
          to: recipient,
          status: "PENDING",
          network: process.env.NETWORK ?? null,
        },
      });
      return created;
    });

    // Note: sending on-chain (sendNativeEth) should be done by server process/admin wallet.
    // For now just return transaction created.
    return NextResponse.json({ success: true, tx });
  } catch (err: any) {
    console.error("POST /api/withdraws/create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
