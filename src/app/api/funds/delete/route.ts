import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/verify";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ ok: false, error: "Missing ID" }, { status: 400 });

  await prisma.fund.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
