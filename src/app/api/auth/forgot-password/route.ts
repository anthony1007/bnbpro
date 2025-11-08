import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { resetPasswordEmail } from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1h

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetExpires },
    });

     // Nodemailer transport
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: true, 
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

    // ✅ Check connection
    await transporter.verify();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset Request",
      html: resetPasswordEmail(resetUrl, user.name || undefined),
    });

    return NextResponse.json({ message: "Reset link sent successfully" });
  } catch (err: any) {
    console.error("Forgot-password error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
