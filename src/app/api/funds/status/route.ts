// // src/app/api/funds/status/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { verifyTokenFromCookie } from "@/lib/verify";

// export async function GET(req: Request) {
//   try {
//     // get token from cookie header robustly
//     const cookie = req.headers.get("cookie") ?? "";
//     const token = cookie.split("token=")[1]?.split(";")[0] ?? null;
//     const payload = await verifyTokenFromCookie(token);
//     if (!payload?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const userId = Number(payload.id);

//     // Get all purchases for this user, include fund + image
//     const purchases = await prisma.fundPurchase.findMany({
//       where: { userId },
//       include: { fund: { include: { image: true } } },
//     });

//     const now = Date.now();

//     const statuses = purchases.map((p) => {
//       const joinedAtMs = p.joinedAt.getTime();
//       const lastClaimMs = p.lastClaimedAt?.getTime() ?? joinedAtMs;
//       const perday = p.perday ?? p.fund?.perday ?? 0;
//       const quarter = p.quarter ?? p.fund?.quarter ?? 0;
//       const pkg = p.package ?? p.fund?.package ?? 0;

//       // next claim time is lastClaimedAt + 24h
//       const nextClaimTime = lastClaimMs + 24 * 60 * 60 * 1000;

//       // compute how many days since joined (floor)
//       const daysSinceJoined = Math.floor((now - joinedAtMs) / (24 * 60 * 60 * 1000));
//       const cycleCompleted = quarter > 0 && daysSinceJoined >= quarter;

//       const isPurchased = true;
//       const isClaimable = !cycleCompleted && now >= nextClaimTime;

//       return {
//         fundId: p.fundId,
//         isPurchased,
//         isClaimable,
//         nextClaimTime,
//         joinedAt: p.joinedAt.toISOString(),
//         lastClaimedAt: p.lastClaimedAt.toISOString(),
//         quarter,
//         package: pkg,
//         perday,
//         plan: p.fund?.plan ?? null,
//         image: p.fund?.image ? { id: p.fund.image.id, url: p.fund.image.url } : null,
//         purchaseId: p.id,
//       };
//     });

//     return NextResponse.json({ statuses, serverTime: now });
//   } catch (err) {
//     console.error("GET /api/funds/status error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }


// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import prisma from "@/lib/prisma";
// import { verifyTokenFromCookie } from "@/lib/verify";

// export async function GET() {
//   try {
//     const token = (await cookies()).get("token")?.value;
//     if (!token)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const payload = await verifyTokenFromCookie(token);
//     if (!payload?.id)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const purchases = await prisma.fundPurchase.findMany({
//       where: { userId: Number(payload.id) },
//       include: { fund: true },
//     });

//     const statuses = purchases.map((p) => ({
//       fundId: p.fundId,
//       plan: p.fund.plan,
//       package: p.fund.package,
//       perday: p.fund.perday,
//       quarter: p.fund.quarter,
//     }));

//     return NextResponse.json({ statuses });
//   } catch (err) {
//     console.error("❌ /api/funds/status error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }



// src/app/api/funds/status/route.ts
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

