// src/app/api/wallet/create/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyUser } from "@/lib/verify";
import { ethers } from "ethers";

const RPC = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
const MASTER_MNEMONIC = process.env.MASTER_MNEMONIC || "";
const BASE_PATH = "m/44'/60'/0'/0";

if (!RPC) console.warn("RPC not set. Set SEPOLIA_RPC_URL in env.");

export async function POST(req: Request) {
  /**
   * Tạo deposit wallet deterministic cho user:
   * - Nếu đã có UserWallet / DepositAddress thì trả về cái hiện có.
   * - Nếu chưa có: derive từ MASTER_MNEMONIC (index userId) và lưu vào UserWallet + DepositAddress.
   *
   * Yêu cầu: verifyUser() trả về { userId, role }.
   */

  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value ?? null;
    const auth = await verifyUser();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(auth.userId);

    // nếu user đã có deposit address active -> trả về
    const existing = await prisma.userWallet.findFirst({
      where: { userId, isActive: true },
    });
    if (existing) {
      return NextResponse.json({ address: existing.address });
    }

    // derive address deterministic bằng userId (index)
    if (!MASTER_MNEMONIC) {
      return NextResponse.json({ error: "MASTER_MNEMONIC not configured" }, { status: 500 });
    }

    const index = userId; // deterministic
    const path = `${BASE_PATH}/${index}`;
    // ethers v6: HDNodeWallet
    const hd = ethers.HDNodeWallet.fromPhrase(MASTER_MNEMONIC, path);
    const address = hd.address.toLowerCase();

    // create userWallet + depositAddress
    const created = await prisma.userWallet.create({
      data: {
        userId,
        address,
        isActive: true,
      },
    });

    await prisma.depositAddress.create({
      data: {
        userId,
        address,
        chain: "sepolia",
        derivationIndex: index,
      },
    });

    return NextResponse.json({ address });
  } catch (err: any) {
    console.error("POST /api/wallet/create error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
