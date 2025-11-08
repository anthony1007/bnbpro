// src/app/api/deposit/webhook/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ethers } from "ethers";
import { Prisma } from "@prisma/client";

const RPC = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC);

/**
 * Webhook endpoint để cập nhật deposit (dùng khi bạn có watcher node/process hoặc webhook)
 * Body expected: { txHash: string } OR { txHash, to, from, amountWei }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const txHash: string | undefined = body?.txHash;

    if (!txHash) {
      return NextResponse.json({ error: "Missing txHash" }, { status: 400 });
    }

    // verify tx onchain
    const tx = await provider.getTransaction(txHash);
    if (!tx) return NextResponse.json({ error: "Transaction not found onchain" }, { status: 404 });

    const receipt = await provider.getTransactionReceipt(txHash);
    // get to address
    const to = tx.to?.toLowerCase() ?? body.to?.toLowerCase();
    const from = tx.from?.toLowerCase() ?? body.from?.toLowerCase();
    const amountWei = tx.value?.toString() ?? body.amountWei?.toString() ?? "0";

    if (!to) return NextResponse.json({ error: "To address not found" }, { status: 400 });

    // find user by depositAddress / userWallet
    const deposit = await prisma.depositAddress.findFirst({
      where: { address: to },
    });

    if (!deposit) {
      console.warn("Deposit webhook: address not mapped to user:", to);
      return NextResponse.json({ ok: true, note: "Address not mapped to any user" });
    }

    const userId = deposit.userId;

    // check existing transaction by txHash
    const existing = await prisma.transaction.findUnique({ where: { txHash } });
    if (existing) {
      return NextResponse.json({ ok: true, note: "Already recorded" });
    }

    // create transaction record and update user balance inside transaction
    await prisma.$transaction(async (txc) => {
      await txc.transaction.create({
        data: {
          userId,
          fundId: null,
          type: "Deposit",
          amount: new Prisma.Decimal(amountWei),
          tokenSymbol: "ETH",
          tokenAddress: null,
          txHash,
          from,
          to,
          status: "SUCCESS",
        },
      });

      // update user balance (db stored as Decimal)
      const user = await txc.user.findUnique({ where: { id: userId } });
      const old = user?.balanceWei ?? "0";
      const newBal = new Prisma.Decimal(old).add(new Prisma.Decimal(amountWei));
      await txc.user.update({
        where: { id: userId },
        data: { balanceWei: newBal },
      });
    });

    return NextResponse.json({ ok: true, txHash });
  } catch (err: any) {
    console.error("POST /api/deposit/webhook error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
