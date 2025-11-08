import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

export async function GET() {
  // list funds (public admin)
  try {
    const funds = await prisma.fund.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ funds });
  } catch (err: any) {
    console.error("GET /api/admin/funds error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  /**
   * Create fund => only ADMIN
   * Body: { plan, package, perday, quarter, imageId? }
   */
  try {
    const token = (await (await import("next/headers")).cookies()).get("token")?.value ?? null;
    const auth = await verifyUser();
    if (!auth?.userId || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = String(body?.plan ?? "").trim();
    const pkg = Number(body?.package ?? 0);
    const perday = body?.perday ? Number(body.perday) : null;
    const quarter = body?.quarter ? Number(body.quarter) : 0;
    const imageId = body?.imageId ?? null;

    if (!plan || !pkg || !quarter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.fund.create({
      data: {
        plan,
        package: pkg,
        perday,
        quarter,
        imageId,
      },
    });

    return NextResponse.json({ success: true, fund: created });
  } catch (err: any) {
    console.error("POST /api/admin/funds error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
