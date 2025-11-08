import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/verify";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {    
    const auth = await verifyAdmin();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const fund = await prisma.fund.create({
      data: {
        plan: body.plan,
        package: Number(body.package),
        perday: body.perday ? Number(body.perday) : null,
        quarter: body.quarter ? Number(body.quarter) : null,
        imageId: body.imageId ?? null,
      },
      include: { image: true },
    });

    return NextResponse.json({ ok: true, fund });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
