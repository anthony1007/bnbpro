// src/app/api/wallet/balance/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";
import { ethers } from "ethers";

const RPC = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC);

export async function GET(req: Request) {
  /**
   * Query params:
   * - onchainOnly=true -> chỉ trả on-chain balance cho deposit wallet (nếu có)
   * Response:
   * { dbBalance: string, onchainBalanceWei: string, address?: string }
   */
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value ?? null;
    const auth = await verifyUser();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(auth.userId);

    const url = new URL(req.url);
    const onchainOnly = url.searchParams.get("onchainOnly") === "true";

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // lấy deposit address (take first active)
    const uw = await prisma.userWallet.findFirst({
      where: { userId, isActive: true },
    });

    let onchainBalanceWei = "0";
    if (uw?.address) {
      try {
        const b = await provider.getBalance(uw.address);
        onchainBalanceWei = b.toString();
      } catch (err) {
        console.warn("Failed to fetch onchain balance:", err);
      }
    }

    if (onchainOnly) {
      return NextResponse.json({ address: uw?.address ?? null, onchainBalanceWei });
    }

    return NextResponse.json({
      dbBalance: (user.balanceWei ?? "0").toString(),
      onchainBalanceWei,
      address: uw?.address ?? null,
    });
  } catch (err: any) {
    console.error("GET /api/wallet/balance error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
