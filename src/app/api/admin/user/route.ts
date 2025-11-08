// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await prisma.user.findMany({ select: { id: true, email: true, address: true } });
  return NextResponse.json(user);
}
