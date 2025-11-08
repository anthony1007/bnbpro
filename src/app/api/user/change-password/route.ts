import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Missing password fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(auth.userId) },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash },
    });

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch (err: any) {
    console.error("POST /api/user/change-password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
