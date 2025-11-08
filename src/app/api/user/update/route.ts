import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, address, phone } = await req.json();

    const updated = await prisma.user.update({
      where: { id: Number(auth.userId) },
      data: {
        name: name?.trim() || undefined,
        address: address?.trim() || undefined,
        phone: phone?.trim() || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        sponsor: true,
        address: true,
        phone: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("Error updating profile:", err);
    return NextResponse.json(
      { error: "Failed to update profile", details: err.message },
      { status: 500 }
    );
  }
}
