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

async function safeGetCookies() {
  const maybe = cookies();
  if (maybe instanceof Promise) {
    return await maybe;
  }
  return maybe;
}

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
