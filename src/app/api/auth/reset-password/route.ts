import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { resetSuccessEmail } from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // ✅ Kiểm tra user có token hợp lệ và chưa hết hạn không
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() }, // còn hạn
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // ✅ Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Update user, xóa token reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    });

    // ✅ Gửi email thông báo thành công
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: true, 
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Your password has been changed",
        html: resetSuccessEmail(user.name || undefined),
      });
    } catch (mailErr) {
      console.warn("⚠️ Password reset successful but failed to send email:", mailErr);
    }

    return NextResponse.json(
      {
        message:
          "Password reset successfully. You can now login with your new password.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset Password Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
