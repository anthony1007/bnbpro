import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";

export async function GET() {
  const user = await verifyUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = user.role === "ADMIN" ? {} : { userId: user.userId };
  const tickets = await prisma.supportTicket.findMany({
    where,
    include: { user: true, replies: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tickets, role: user.role });
}

export async function POST(req: Request) {
  const user = await verifyUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, ticketId, message, status, replyId } = body;

  if (action === "reply") {
    if (user.role !== "ADMIN")
      return NextResponse.json({ error: "Only admin can reply" }, { status: 403 });
    await prisma.ticketReply.create({
      data: { ticketId, adminId: user.userId, message },
    });
  } else if (action === "status") {
    if (user.role !== "ADMIN")
      return NextResponse.json({ error: "Only admin can change status" }, { status: 403 });
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  } else if (action === "editReply") {
    if (user.role !== "ADMIN")
      return NextResponse.json({ error: "Only admin can edit replies" }, { status: 403 });
    await prisma.ticketReply.update({
      where: { id: replyId },
      data: { message },
    });
  } else if (action === "deleteReply") {
    if (user.role !== "ADMIN")
      return NextResponse.json({ error: "Only admin can delete replies" }, { status: 403 });
    await prisma.ticketReply.delete({ where: { id: replyId } });
  }

  return NextResponse.json({ ok: true });
}
