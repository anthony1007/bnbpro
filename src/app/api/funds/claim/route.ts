// src/app/api/funds/claim/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  /**
   * Body: { purchaseId: number }
   * Flow:
   * - verify user
   * - load FundPurchase
   * - check ownership, isActive
   * - check nextClaimAt <= now
   * - compute claimAmount = package * (perday / 100)
   * - ensure not exceed maxClaimable, and not past expiresAt/quarter
   * - update FundPurchase (lastClaimedAt, nextClaimAt, totalClaimed, maybe isActive=false)
   * - update user.balanceWei
   */
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value ?? null;
    const auth = await verifyUser();
    if (!auth?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(auth.userId);

    const body = await req.json().catch(() => ({}));
    const purchaseId = body?.purchaseId;
    if (!purchaseId) return NextResponse.json({ error: "Missing purchaseId" }, { status: 400 });

    const purchase = await prisma.fundPurchase.findUnique({ where: { id: Number(purchaseId) } });
    if (!purchase || purchase.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!purchase.isActive) return NextResponse.json({ error: "Purchase inactive" }, { status: 400 });

    const now = new Date();
    const nextClaimAt = purchase.nextClaimAt ?? purchase.joinedAt;
    if (now < nextClaimAt) return NextResponse.json({ error: "Too early to claim", nextClaimAt }, { status: 400 });

    // daily profit = package * (perday / 100)
    const pkg = Number(purchase.package ?? 0);
    const perday = Number(purchase.perday ?? 0);
    const quarter = Number(purchase.quarter ?? 0);

    const claimAmount = Number((pkg * (perday / 100)).toFixed(8));

    // ensure not exceed maxClaimable
    const max = Number(purchase.maxClaimable ?? (pkg * (perday / 100) * quarter));
    const wouldTotal = Number(purchase.totalClaimed ?? 0) + claimAmount;
    const actualClaim = wouldTotal > max ? Math.max(0, max - Number(purchase.totalClaimed ?? 0)) : claimAmount;

    if (actualClaim <= 0) {
      // mark completed if needed
      await prisma.fundPurchase.update({
        where: { id: purchase.id },
        data: { isActive: false, status: "COMPLETED" },
      });
      return NextResponse.json({ error: "Nothing to claim - completed" }, { status: 400 });
    }

    // compute nextClaimAt and check expires
    const newNext = new Date(now.getTime() + 24 * 3600 * 1000);
    let willExpire = false;
    if (purchase.expiresAt && now >= purchase.expiresAt) {
      willExpire = true;
    }

    // update DB atomically
    await prisma.$transaction(async (tx) => {
      await tx.fundPurchase.update({
        where: { id: purchase.id },
        data: {
          lastClaimedAt: now,
          nextClaimAt: newNext,
          totalClaimed: { increment: actualClaim as any }, // numeric increment
        },
      });

      // add to user balance
      const user = await tx.user.findUnique({ where: { id: userId } });
      const old = user?.balanceWei ?? "0";
      const newBal = new Prisma.Decimal(old).add(new Prisma.Decimal(String(actualClaim)));
      await tx.user.update({
        where: { id: userId },
        data: { balanceWei: newBal },
      });

      // insert profit transaction
      await tx.transaction.create({
        data: {
          userId,
          fundId: purchase.fundId,
          type: "Claim",
          amount: new Prisma.Decimal(String(actualClaim)),
          tokenSymbol: "ETH",
          tokenAddress: null,
          txHash: null,
          from: null,
          to: null,
          status: "SUCCESS",
        },
      });
    });

    // after update, if reached max or expiry -> mark completed
    const p2 = await prisma.fundPurchase.findUnique({ where: { id: purchase.id } });
    const totalAfter = Number(p2?.totalClaimed ?? 0);
    if (totalAfter >= (Number(p2?.maxClaimable ?? 0)) || (p2?.expiresAt && new Date() >= p2.expiresAt)) {
      await prisma.fundPurchase.update({
        where: { id: purchase.id },
        data: { isActive: false, status: "COMPLETED" },
      });
    }

    return NextResponse.json({ success: true, claimed: actualClaim });
  } catch (err: any) {
    console.error("POST /api/funds/claim error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
