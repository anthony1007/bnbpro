import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/verify";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  const updated = await prisma.fund.update({
    where: { id: body.id },
    data: {
      plan: body.plan,
      package: Number(body.package),
      perday: body.perday ? Number(body.perday) : null,
      quarter: body.quarter ? Number(body.quarter) : null,
      imageId: body.imageId ?? null,
    },
    include: { image: true },
  });

  return NextResponse.json({ ok: true, fund: updated });
}
