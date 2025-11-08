import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

export async function GET() {
  try {
    const auth = await verifyUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const purchases = await prisma.fundPurchase.findMany({
      where: { userId: auth.userId },
      select: { fundId: true },
    });

    return NextResponse.json({
      purchasedFundIds: purchases.map(p => p.fundId),
    });
  } catch (err: any) {
    console.error("GET /funds/purchased error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
