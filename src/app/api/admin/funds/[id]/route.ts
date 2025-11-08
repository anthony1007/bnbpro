import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const f = await prisma.fund.findUnique({ where: { id } });
    if (!f) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ fund: f });
  } catch (err: any) {
    console.error("GET /api/admin/funds/[id] error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await (await import("next/headers")).cookies()).get("token")?.value ?? null;
    const auth = await verifyUser();
    if (!auth?.userId || auth.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    const body = await req.json().catch(() => ({}));
    const data: any = {};
    if (body.plan !== undefined) data.plan = body.plan;
    if (body.package !== undefined) data.package = Number(body.package);
    if (body.perday !== undefined) data.perday = body.perday === null ? null : Number(body.perday);
    if (body.quarter !== undefined) data.quarter = Number(body.quarter);
    if (body.imageId !== undefined) data.imageId = body.imageId;

    const updated = await prisma.fund.update({ where: { id }, data });
    return NextResponse.json({ success: true, fund: updated });
  } catch (err: any) {
    console.error("PUT /api/admin/funds/[id] error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = (await (await import("next/headers")).cookies()).get("token")?.value ?? null;
    const auth = await verifyUser();
    if (!auth?.userId || auth.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    await prisma.fund.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/admin/funds/[id] error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
