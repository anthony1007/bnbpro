import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

export async function GET() {
  try {    
    const auth = await verifyUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(auth.userId);

    const purchases = await prisma.fundPurchase.findMany({
      where: { userId },
      include: { fund: true },
    });

    const statuses = purchases.map((p) => ({
      fundId: String(p.fundId),
      isPurchased: true,
      totalClaimed: p.totalClaimed ?? 0,
      lastClaimedAt: p.lastClaimedAt ?? null,
      plan: p.fund.plan,
    }));

    return NextResponse.json({ statuses, serverTime: Date.now() });
  } catch (err) {
    console.error("Error fetching fund status:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

