import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/verify";
import { z } from "zod";

const updateSchema = z.object({
  plan: z.string().min(1).optional(),
  package: z.number().int().min(1).optional(),
  perday: z.number().positive().nullable().optional(),
  quarter: z.number().int().min(1).optional(),
  imageId: z.string().nullable().optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const fund = await prisma.fund.findUnique({ where: { id }, include: { image: true } });
    if (!fund) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, fund });
  } catch (err: any) {
    console.error("GET /api/funds/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {    
    const auth = await verifyAdmin();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = params.id;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (parsed.data.plan !== undefined) dataToUpdate.plan = parsed.data.plan;
    if (parsed.data.package !== undefined) dataToUpdate.package = parsed.data.package;
    if (parsed.data.perday !== undefined) dataToUpdate.perday = parsed.data.perday;
    if (parsed.data.quarter !== undefined) dataToUpdate.quarter = parsed.data.quarter;
    if (parsed.data.imageId !== undefined) dataToUpdate.imageId = parsed.data.imageId;

    const updated = await prisma.fund.update({ where: { id }, data: dataToUpdate });
    return NextResponse.json({ ok: true, fund: updated });
  } catch (err: any) {
    console.error("PUT /api/funds/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAdmin();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    await prisma.fund.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Deleted" });
  } catch (err: any) {
    console.error("DELETE /api/funds/[id] error:", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
