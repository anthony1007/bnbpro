// src/app/api/withdraw/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";
import { ethers } from "ethers";
import { Prisma } from "@prisma/client";

const RPC = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
const WITHDRAW_PK = process.env.WITHDRAW_WALLET_PRIVATE_KEY || "";
const provider = new ethers.JsonRpcProvider(RPC);
const signer = WITHDRAW_PK ? new ethers.Wallet(WITHDRAW_PK, provider) : null;

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value ?? null;
    const auth = await verifyUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(auth.userId);

    if (!signer) return NextResponse.json({ error: "Server withdraw signer not configured" }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const amountStr = body?.amount;
    const recipient = body?.recipient;
    if (!amountStr || !recipient) return NextResponse.json({ error: "Missing amount or recipient" }, { status: 400 });

    // parse to wei
    let amountWei: bigint;
    try {
      amountWei = ethers.parseEther(String(amountStr));
    } catch {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // check DB balance (Decimal stored)
    const userBal = new Prisma.Decimal(user.balanceWei ?? "0");
    const amountDec = new Prisma.Decimal(amountWei.toString());
    if (userBal.lt(amountDec)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // create pending transaction and deduct balance in a transaction
    const txRecord = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          userId,
          fundId: null,
          type: "Withdraw",
          amount: amountDec,
          tokenSymbol: "ETH",
          tokenAddress: null,
          txHash: null,
          from: null,
          to: recipient,
          status: "PENDING",
        },
      });

      const newBal = userBal.sub(amountDec);
      await tx.user.update({ where: { id: userId }, data: { balanceWei: newBal } });

      return t;
    });

    // send onchain
    try {
      const sent = await signer.sendTransaction({ to: recipient, value: amountWei });
      const receipt = await sent.wait();

      await prisma.transaction.update({
        where: { id: txRecord.id },
        data: {
          txHash: receipt?.hash,
          status: "SUCCESS",
        },
      });

      return NextResponse.json({ success: true, txHash: receipt?.hash });
    } catch (err: any) {
      console.error("Withdraw onchain error:", err);
      // rollback: refund user and mark withdraw failed
      await prisma.$transaction(async (tx) => {
        const u = await tx.user.findUnique({ where: { id: userId } });
        const cur = new Prisma.Decimal(u?.balanceWei ?? "0");
        const restored = cur.add(amountDec);
        await tx.user.update({ where: { id: userId }, data: { balanceWei: restored } });

        await tx.transaction.update({
          where: { id: txRecord.id },
          data: { status: "FAILED"},
        });
      });

      return NextResponse.json({ error: "Onchain withdraw failed", details: (err?.message ?? String(err)) }, { status: 500 });
    }
  } catch (err: any) {
    console.error("POST /api/withdraw error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
