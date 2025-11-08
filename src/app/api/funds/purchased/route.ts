// // src/app/api/funds/purchase/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { verifyUser } from "@/lib/verify";

// type Body = {
//   fundId?: string;
// };

// export async function POST(req: Request) {
//   try {
//     const auth = await verifyUser();
//     if (!auth) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const userId = Number(auth.userId);

//     const body: Body = await req.json().catch(() => ({}));
//     const fundId = body.fundId;
//     if (!fundId) {
//       return NextResponse.json({ error: "Missing fundId" }, { status: 400 });
//     }

//     // load fund
//     const fund = await prisma.fund.findUnique({ where: { id: fundId } });
//     if (!fund) {
//       return NextResponse.json({ error: "Fund not found" }, { status: 404 });
//     }

//     // check if user already has an active purchase for this fund
//     const existing = await prisma.fundPurchase.findFirst({
//       where: { userId, fundId, isActive: true },
//     });
//     if (existing) {
//       return NextResponse.json({ error: "You already purchased this fund and it's active", purchase: existing }, { status: 400 });
//     }

//     // snapshot values from fund
//     const pkg = fund.package ?? 0;
//     const perday = fund.perday ?? 0;
//     const quarter = fund.quarter ?? 0;

//     // compute maxClaimable: package * (perday/100) * quarter
//     const maxClaimable = Number((Number(pkg) * (Number(perday) / 100) * Number(quarter)).toFixed(8));

//     const now = new Date();
//     const nextClaimAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h
//     const expiresAt = quarter && quarter > 0 ? new Date(now.getTime() + quarter * 24 * 60 * 60 * 1000) : null;

//     // create purchase record
//     const created = await prisma.fundPurchase.create({
//       data: {
//         userId,
//         fundId,
//         package: pkg,
//         perday,
//         quarter,
//         status: "PURCHASED",
//         joinedAt: now,
//         lastClaimedAt: now,
//         nextClaimAt: nextClaimAt,
//         expiresAt: expiresAt,
//         totalClaimed: 0,
//         maxClaimable,
//         isActive: true,
//       },
//     });

//     return NextResponse.json({ success: true, purchase: created });
//   } catch (err: any) {
//     console.error("POST /api/funds/purchase error:", err);
//     return NextResponse.json({ error: "Internal server error", details: err?.message ?? String(err) }, { status: 500 });
//   }
// }


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
