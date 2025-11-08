// src/app/api/support/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser, verifyAdmin } from "@/lib/verify";

export async function GET() {
  try {
    const auth = await verifyUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = auth.role === "ADMIN";

    if (isAdmin) {
      // admin => return all tickets
      const tickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, name: true } },
          replies: { orderBy: { createdAt: "asc" } },
        },
      });
      return NextResponse.json({ tickets });
    } else {
      // normal user => return own tickets only
      const tickets = await prisma.supportTicket.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
        include: {
          replies: { orderBy: { createdAt: "asc" } },
        },
      });
      return NextResponse.json({ tickets });
    }
  } catch (err: any) {
    console.error("GET /api/support error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

type ReqBody =
  | { action: "create"; subject: string; message: string }
  | { action: "reply"; ticketId: number; message: string };

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json().catch(() => ({} as any));
    const auth = await verifyUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (body.action === "create") {
      const { subject, message } = body;
      if (!subject || !message) return NextResponse.json({ error: "Missing subject or message" }, { status: 400 });

      const ticket = await prisma.supportTicket.create({
        data: {
          userId: auth.userId,
          subject: subject.trim(),
          message: message.trim(),
          status: "OPEN",
        },
        include: { replies: true },
      });

      return NextResponse.json({ success: true, ticket }, { status: 201 });
    }

    if (body.action === "reply") {
      // only admin allowed to reply
      const admin = await verifyAdmin();
      if (!admin) return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });

      const { ticketId, message } = body as { ticketId?: number; message?: string };
      if (!ticketId || !message) return NextResponse.json({ error: "Missing ticketId or message" }, { status: 400 });

      const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

      const reply = await prisma.ticketReply.create({
        data: {
          ticketId,
          adminId: admin.id,
          message: message.trim(),
        },
      });

      // optionally update ticket status / updatedAt
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "OPEN" }, // or "RESPONDED"
      });

      return NextResponse.json({ success: true, reply }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/support error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}