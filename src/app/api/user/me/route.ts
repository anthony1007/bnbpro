import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";
import { ethers } from "ethers";

const SEPOLIA_RPC = process.env.SEPOLIA_RPC ?? "https://sepolia.infura.io/v3/YOUR_KEY";

// ⚙️ Hàm đọc số dư thực tế trên chuỗi (ETH Sepolia)
async function getOnchainBalance(address?: string | null): Promise<string> {
  if (!address) return "0";
  try {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const balance = await provider.getBalance(address);
    return balance.toString();
  } catch {
    return "0";
  }
}

export async function GET() {
  try {
    const auth = await verifyUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        sponsor: true,
        address: true,
        phone: true,
        balanceWei: true,
        walletAddress: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // kiểm tra onchain balance (ETH testnet)
    const onchainBalance = await getOnchainBalance(user.walletAddress);

    return NextResponse.json({
      user,
      onchainBalance,
      dbBalance: user.balanceWei,
    });
  } catch (err: any) {
    console.error("GET /api/user/me error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
