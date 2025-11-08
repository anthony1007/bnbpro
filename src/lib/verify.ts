// // src/lib/verify.ts
// import { cookies } from "next/headers";
// import { jwtVerify, JWTPayload } from "jose";
// import prisma from "@/lib/prisma";

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret_dev_key");

// export interface TokenPayload extends JWTPayload {
//   id: number;
//   role?: "USER" | "ADMIN";
// }

// /**
//  * Lấy token từ cookies() — tương thích cả App Router (async) và server component (sync)
//  */
// async function getTokenFromCookies(): Promise<string | null> {
//   const maybeCookies = cookies() as unknown;

//   if (maybeCookies instanceof Promise) {
//     const ck = await maybeCookies as any;
//     return ck?.get("token")?.value ?? null;
//   }

//   return (maybeCookies as any)?.get("token")?.value ?? null;
// }

// /**
//  * Xác minh JWT từ cookie — dùng được ở mọi nơi (route handler, server component)
//  */
// export async function verifyUser() {
//   try {
//     const token = await getTokenFromCookies();
//     if (!token) return null;

//     const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET, {
//       algorithms: ["HS256"],
//       clockTolerance: 300, // cho phép lệch 5 phút
//     });

//     if (!payload?.id) return null;
//     console.log("🪪 Token payload", payload, token);
//     return {
//       userId: Number(payload.id),
//       role: (payload.role?.toString().toUpperCase() as "USER" | "ADMIN") ?? "USER",
//       payload,
//     };
//   } catch (err: any) {
//     console.error("❌ verifyUser failed:", err.message);
//     return null;
//   }
// }

// /**
//  * Kiểm tra quyền admin — xác minh user rồi check role trong DB
//  */
// export async function verifyAdmin() {
//   const result = await verifyUser();
//   if (!result) return null;

//   const user = await prisma.user.findUnique({
//     where: { id: result.userId },
//     select: { id: true, email: true, role: true },
//   });

//   if (!user || user.role !== "ADMIN") return null;
//   return user;
// }



import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret_dev_key");

export interface TokenPayload {
  id: number;
  role?: "USER" | "ADMIN";
  iat?: number;
  exp?: number;
}

/**
 * Lấy cookie token an toàn trong mọi môi trường (Next.js 14–15)
 */
async function safeGetCookies() {
  const maybe = cookies();
  if (maybe instanceof Promise) {
    return await maybe;
  }
  return maybe;
}

/**
 * ✅ verifyUser: xác minh token và trả về userId + role
 */
export async function verifyUser() {
  try {
    const ck = await safeGetCookies();
    const token = ck?.get("token")?.value;
    if (!token) {
      console.warn("⚠️ Không tìm thấy token trong cookie");
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
    if (!payload?.id) return null;

    console.log("🪪 Token payload", payload);

    return {
      userId: Number(payload.id),
      role: (payload.role?.toString().toUpperCase() as "USER" | "ADMIN") ?? "USER",
      payload,
    };
  } catch (err: any) {
    console.error("❌ verifyUser failed:", err.message);
    return null;
  }
}

/**
 * ✅ verifyAdmin: chỉ admin mới qua
 */
export async function verifyAdmin() {
  const result = await verifyUser();
  if (!result) return null;

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;
  return user;
}
