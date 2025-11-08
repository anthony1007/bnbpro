// src/app/api/admin/deposits/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma.ts";

export async function GET() {
  const deposit = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(deposit);
}
