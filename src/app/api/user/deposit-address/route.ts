// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { HDNodeWallet } from "ethers";
// import { verifyUser } from "@/lib/verify";

// const MNEMONIC = process.env.MASTER_MNEMONIC ?? "";
// const BASE_PATH = "m/44'/60'/0'/0"; // chuẩn derivation ETH/BSC

// function deriveAddressFromMnemonic(mnemonic: string, index: number): string {
//   if (!mnemonic) throw new Error("MASTER_MNEMONIC missing");
//   const fullPath = `${BASE_PATH}/${index}`;
//   const wallet = HDNodeWallet.fromPhrase(mnemonic, undefined, fullPath);
//   return wallet.address.toLowerCase();
// }

// export async function GET() {
//   try {
//     const auth = await verifyUser();
//     if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const existing = await prisma.depositAddress.findFirst({
//       where: { userId: auth.userId },
//     });

//     return NextResponse.json({ depositAddress: existing?.address ?? null });
//   } catch (err: any) {
//     console.error("GET /api/user/deposit-address error:", err);
//     return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
//   }
// }

// export async function POST() {
//   try {
//     const auth = await verifyUser();
//     if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const userId = auth.userId;
//     const existing = await prisma.depositAddress.findFirst({ where: { userId } });
//     if (existing) return NextResponse.json({ depositAddress: existing.address });

//     const addr = deriveAddressFromMnemonic(MNEMONIC, userId);
//     await prisma.depositAddress.create({
//       data: {
//         userId,
//         address: addr,
//         chain: "bsc",
//         derivationIndex: userId,
//       },
//     });

//     return NextResponse.json({ depositAddress: addr });
//   } catch (err: any) {
//     console.error("POST /api/user/deposit-address error:", err);
//     return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { HDNodeWallet } from "ethers";
import { verifyUser } from "@/lib/verify";

const MNEMONIC = process.env.MASTER_MNEMONIC ?? "";
const BASE_PATH = "m/44'/60'/0'/0"; // chuẩn derivation ETH/BSC

function deriveAddressFromMnemonic(mnemonic: string, index: number): string {
  if (!mnemonic) throw new Error("MASTER_MNEMONIC missing");
  const fullPath = `${BASE_PATH}/${index}`;
  const wallet = HDNodeWallet.fromPhrase(mnemonic, undefined, fullPath);
  return wallet.address.toLowerCase();
}

export async function GET() {
  try {
    const auth = await verifyUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const wallet = await prisma.userWallet.findUnique({
      where: { userId: auth.userId },
    });

    return NextResponse.json({ depositAddress: wallet?.address ?? null });
  } catch (err: any) {
    console.error("GET /api/user/deposit-address error:", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const auth = await verifyUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = auth.userId;
    const existing = await prisma.userWallet.findUnique({ where: { userId } });
    if (existing) return NextResponse.json({ depositAddress: existing.address });

    const addr = deriveAddressFromMnemonic(MNEMONIC, userId);
    await prisma.userWallet.create({
      data: {
        userId,
        address: addr,
        isActive: true,
      },
    });

    console.log(`🪙 Created wallet for user ${userId}: ${addr}`);
    return NextResponse.json({ depositAddress: addr });
  } catch (err: any) {
    console.error("POST /api/user/deposit-address error:", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
