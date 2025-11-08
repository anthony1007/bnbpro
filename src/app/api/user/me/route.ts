// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { verifyTokenFromCookie } from "@/lib/verify";

// export async function GET(req: NextRequest) {
//   try {
//     const token = req.cookies.get("token")?.value ?? null;
//     const payload = await verifyTokenFromCookie(token);
//     if (!payload?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     const userId = Number(payload.id);
//     const dbUser = await prisma.user.findUnique({ where: { id: userId }, 
//     select: { balanceWei: true, email: true, name: true, address: true, walletAddress: true, sponsor: true, phone: true }});
//     return NextResponse.json(dbUser ?? {});
  
//   } catch (err: any) {
//     console.error("GET /api/user/me error:", err);
//     return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
//   }
// }


// // src/app/api/user/me/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { verifyUser } from "@/lib/verify";

// export async function GET(req: Request) {
//   try {
//     const auth = await verifyUser();
//     if (!auth) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const userId = Number(auth.userId);
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         sponsor: true,
//         address: true,
//         phone: true,
//         balanceWei: true,
//         walletAddress: true,
//       },
//     });

//     if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

//     return NextResponse.json({ user });
//   } catch (err: any) {
//     console.error("GET /api/user/me error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }


// ✅ API: /api/user/me
// Chức năng: lấy thông tin user + số dư onchain (ETH Sepolia) hoặc db

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
