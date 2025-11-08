// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcrypt";
// import { SignJWT } from "jose";

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
//     const token = await new SignJWT({ id: user.id, role: user.role })
//       .setProtectedHeader({ alg: "HS256" })
//       .setExpirationTime("3h")
//       .sign(secret);


//     const res = NextResponse.json({ message: "Login successful" });

//     res.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax", 
//       path: "/",
//     });

//     return res;
//   } catch (err) {
//     console.error("Login error:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }


// src/app/api/auth/login/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcrypt";
// import { SignJWT } from "jose";

// const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();

//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     // ✅ Dùng jose để tạo token, tương thích middleware
//     const token = await new SignJWT({
//       id: user.id,
//       role: user.role,
//     })
//       .setProtectedHeader({ alg: "HS256" })
//       .setIssuedAt()
//       .setExpirationTime("3h") // <— jose hiểu đúng định dạng
//       .sign(secret);

//     const res = NextResponse.json({ message: "Login successful" });

//     res.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//     });

//     return res;
//   } catch (err) {
//     console.error("Login error:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }



// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret_dev_key");

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });

  const token = await new SignJWT({ id: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const res = NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}


