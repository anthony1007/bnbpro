// src/app/api/admin/withdraws/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTokenFromCookie } from "@/lib/verify";

function isAdmin(payload: { id: string; role?: string } | null) {
  return payload && payload.role === "ADMIN";
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value ?? null;
    const userPayload = await verifyTokenFromCookie(token);
    const userRole = userPayload ? {id: userPayload.id.toString(), role: userPayload.role} : null;
    if (!isAdmin(userRole)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const withdrawId = body?.withdrawId;
    if (!withdrawId) return NextResponse.json({ error: "Missing withdrawId" }, { status: 400 });

    const w = await prisma.transaction.findUnique({ where: { id: Number(withdrawId) } });
    if (!w) return NextResponse.json({ error: "Withdraw not found" }, { status: 404 });

    if (w.status !== "PENDING") {
      return NextResponse.json({ error: "Can only approve PENDING withdraws" }, { status: 400 });
    }

    await prisma.transaction.update({
      where: { id: w.id },
      data: { status: "SUCCESS" },
    });

    return NextResponse.json({ success: true, message: "Withdraw approved (PROCESSING)" });
  } catch (err: any) {
    console.error("POST /api/admin/withdraws/approve error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
