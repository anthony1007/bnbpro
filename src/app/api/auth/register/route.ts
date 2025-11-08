// import { NextResponse } from "next/server";
// import bcrypt from "bcrypt";
// import prisma from "@/lib/prisma";

// type ReqBody = { email?: string; password?: string; name?: string };

// export async function POST(req: Request) {
//   try {
//     const body: ReqBody = await req.json();

//     const email = (body.email || "").trim().toLowerCase();
//     const password = body.password || "";
//     const name = (body.name || "").trim();

//     if (!email || !password) {
//       return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
//     }
//     if (password.length < 6) {
//       return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
//     }

//     const existing = await prisma.user.findUnique({ where: { email } });
//     if (existing) {
//       return NextResponse.json({ error: "Email already registered" }, { status: 400 });
//     }

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: { email, password: hashed, name },
//       select: { id: true, email: true, name: true, role: true },
//     });

//     return NextResponse.json({ message: "User created", user }, { status: 201 });
//   } catch (err) {
//     console.error("Register error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

type ReqBody = { email?: string; password?: string; name?: string };

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json();

    // 🧹 Sanitize input
    const email = (body.email || "").replace(/\0/g, "").trim().toLowerCase();
    const password = (body.password || "").replace(/\0/g, "");
    const name = (body.name || "").replace(/\0/g, "").trim();

    console.log("🔍 Register attempt:", { email, name });

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
      select: { id: true, email: true, name: true, role: true },
    });

    console.log("✅ User created:", user.email);
    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (err: any) {
    console.error("❌ Register error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
