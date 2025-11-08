// // src/app/api/funds/purchase/route.ts
// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import prisma from "@/lib/prisma";
// import { verifyUser } from "@/lib/verify";
// import { Prisma } from "@prisma/client";

// export async function POST(req: Request) {
//   /**
//    * Body: { fundId: string }
//    * Flow:
//    * - verify user
//    * - load fund
//    * - check user balance >= package
//    * - create FundPurchase snapshot, deduct balance (atomic)
//    */

//   try {
//     const cookieStore = cookies();
//     const token = (await cookieStore).get("token")?.value ?? null;
//     const auth = await verifyUser();
//     if (!auth?.userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const userId = Number(auth.userId);

//     const body = await req.json().catch(() => ({}));
//     const fundId = body?.fundId;
//     if (!fundId) return NextResponse.json({ error: "Missing fundId" }, { status: 400 });

//     const fund = await prisma.fund.findUnique({ where: { id: fundId } });
//     if (!fund) return NextResponse.json({ error: "Fund not found" }, { status: 404 });

//     // snapshot values
//     const pkg = fund.package ?? 0;
//     const perday = fund.perday ?? 0;
//     const quarter = fund.quarter ?? 0;

//     // user balance check and purchase in transaction
//     const result = await prisma.$transaction(async (tx) => {
//       const user = await tx.user.findUnique({ where: { id: userId } });
//       if (!user) throw new Error("User not found");

//       const userBal = new Prisma.Decimal(user.balanceWei ?? "0");
//       const pkgDecimal = new Prisma.Decimal(pkg.toString());

//       if (userBal.lt(pkgDecimal)) {
//         throw new Error("Insufficient balance");
//       }

//       // compute maxClaimable = package * perday/100 * quarter
//       const maxClaimable = Number((pkg * (perday / 100) * quarter).toFixed(8));

//       const now = new Date();
//       const nextClaimAt = new Date(now.getTime() + 24 * 3600 * 1000);
//       const expiresAt = quarter > 0 ? new Date(now.getTime() + quarter * 24 * 3600 * 1000) : null;

//       const purchase = await tx.fundPurchase.create({
//         data: {
//           userId,
//           fundId,
//           package: pkg,
//           perday,
//           quarter,
//           status: "ACTIVE",
//           joinedAt: now,
//           lastClaimedAt: now,
//           nextClaimAt,
//           isActive: true,
//           expiresAt,
//           maxClaimable,
//           totalClaimed: 0,
//         },
//       });

//       // deduct user balance
//       const newBal = userBal.sub(pkgDecimal);
//       await tx.user.update({
//         where: { id: userId },
//         data: { balanceWei: newBal },
//       });

//       // create a transaction record for purchase (Withdraw-like)
//       await tx.transaction.create({
//         data: {
//           userId,
//           fundId,
//           type: "Withdraw",
//           amount: pkgDecimal,
//           tokenSymbol: "ETH",
//           tokenAddress: null,
//           txHash: null,
//           from: null,
//           to: null,
//           status: "SUCCESS",
//         },
//       });

//       return purchase;
//     });

//     return NextResponse.json({ success: true, purchase: result });
//   } catch (err: any) {
//     console.error("POST /api/funds/purchase error:", err);
//     return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
//   }
// }



// src/jobs/scanDeposits.ts
/**
 * Job: scanDeposits
 *
 * Mô tả (Tiếng Việt):
 * - Quét các giao dịch (native ETH txs) và sự kiện Transfer (ERC20) đến DEPOSIT_WALLET.
 * - Khi phát hiện deposit: tìm user qua userWallet.address === tx.from (address gửi).
 * - Nếu tìm thấy user: tạo Transaction (type = Deposit), cập nhật user.balanceWei (tăng bằng smallest unit).
 * - Lưu checkpoint lastScannedBlock trong file .data/lastScannedBlock.json để lần chạy sau tiếp tục.
 *
 * Yêu cầu env:
 * - NETWORK, SEPOLIA_RPC, BSC_RPC
 * - DEPOSIT_WALLET_ADDRESS
 *
 * Notes:
 * - Script xử lý ETH (native) bằng cách kiểm tra tx.to === DEPOSIT_WALLET_ADDRESS.
 * - Script xử lý ERC20 (USDT) bằng getLogs Transfer topics + decode.
 * - Không sweep. Không thay đổi private keys.
 */

import { ethers } from "ethers";
import fs from "fs-extra";
import path from "path";
import prisma from "@/lib/prisma";

const DEPOSIT_ADDR = (process.env.DEPOSIT_WALLET_ADDRESS || "").toLowerCase();
const NETWORK = process.env.NETWORK || "sepolia";
const SEPOLIA_RPC = process.env.SEPOLIA_RPC || "";
const BSC_RPC = process.env.BSC_RPC || "";
const SCAN_FROM_BLOCK = process.env.SCAN_FROM_BLOCK || "auto";
const SCAN_BLOCK_WINDOW = Number(process.env.SCAN_BLOCK_WINDOW || "200");

const LAST_BLOCK_FILE = path.join(process.cwd(), ".data", "lastScannedBlock.json");
fs.ensureDirSync(path.join(process.cwd(), ".data"));

// Minimal ERC20 Transfer event topic
const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

// fallback decimals map (if can't call token.decimals())
const FALLBACK_DECIMALS: Record<string, number> = {
  // Add addresses (lowercase) -> decimals
  // USDT on BSC example (mainnet)
  [ (process.env.USDT_TOKEN_ADDRESS_BSC || "").toLowerCase() ]: 6,
};

function providerForNetwork() {
  if (NETWORK === "sepolia") return new ethers.JsonRpcProvider(SEPOLIA_RPC);
  // default to bsc if not sepolia
  return new ethers.JsonRpcProvider(BSC_RPC);
}

async function readLastBlock(): Promise<number | null> {
  try {
    if (!fs.existsSync(LAST_BLOCK_FILE)) return null;
    const raw = await fs.readFile(LAST_BLOCK_FILE, "utf-8");
    const data = JSON.parse(raw);
    return typeof data.lastBlock === "number" ? data.lastBlock : null;
  } catch (e) {
    return null;
  }
}
async function writeLastBlock(b: number) {
  await fs.writeFile(LAST_BLOCK_FILE, JSON.stringify({ lastBlock: b }, null, 2), "utf-8");
}

// convert string value (smallest unit) to BigInt safely
function toBigIntSafe(v: string | number | bigint) {
  try {
    return BigInt(String(v));
  } catch {
    return BigInt(0);
  }
}

export default async function scanDeposits() {
  const provider = providerForNetwork();

  const latest = await provider.getBlockNumber();
  let fromBlock = await readLastBlock();

  if (!fromBlock) {
    if (SCAN_FROM_BLOCK === "auto") {
      // start somewhat earlier to be safe
      fromBlock = Math.max(0, latest - 500);
    } else {
      const n = Number(SCAN_FROM_BLOCK);
      fromBlock = Number.isFinite(n) ? n : Math.max(0, latest - 500);
    }
  }

  if (fromBlock >= latest) {
    // nothing to do
    return { scannedFrom: fromBlock, scannedTo: latest, found: 0 };
  }

  // limit window to avoid big queries
  const toBlock = Math.min(latest, fromBlock + SCAN_BLOCK_WINDOW);

  let foundCount = 0;

  try {
    // 1) Handle ERC20 Transfer events TO DEPOSIT_ADDR
    // We'll query logs filtered by to = deposit address (can't directly filter indexed 'to' param unless we supply topic2)
    // topic[0] = Transfer
    // topic[2] = indexed to address (32 bytes)
    const topicTo = ethers.hexZeroPad(DEPOSIT_ADDR, 32).toLowerCase().replace(/^0x/, "0x"); // ensure format
    // But ethers.getLogs accepts 'topics' where topic[2] is padded hex of address.
    const logs = await provider.getLogs({
      fromBlock,
      toBlock,
      topics: [TRANSFER_TOPIC, null, ethers.hexZeroPad(DEPOSIT_ADDR, 32)],
    }).catch(() => [] as ethers.Log[]);

    // Process ERC20 logs
    for (const log of logs) {
      try {
        const tokenAddress = (log.address || "").toLowerCase();
        // decode topics: topics[1] = from, topics[2] = to
        const fromTopic = log.topics[1];
        const fromAddr = fromTopic ? ethers.getAddress(ethers.hexStripZeros(fromTopic)) : null;
        const valueHex = log.data;
        const valueBI = toBigIntSafe(valueHex);
        const txHash = log.transactionHash;

        if (!fromAddr) continue;
        // map user by UserWallet.address === fromAddr (lowercase)
        const userWallet = await prisma.userWallet.findFirst({
          where: { address: fromAddr.toLowerCase() },
          include: { user: true },
        });
        if (!userWallet) {
          // not recognized — skip or optionally log
          continue;
        }

        // check existing transaction duplicate by txHash in DB
        const exist = await prisma.transaction.findFirst({ where: { txHash } });
        if (exist) continue; // already recorded

        // detect decimals for token
        let decimals = FALLBACK_DECIMALS[tokenAddress] ?? 18;
        try {
          const erc20 = new ethers.Contract(tokenAddress, ["function decimals() view returns (uint8)"], provider);
          const d = await erc20.decimals().catch(() => null);
          if (typeof d === "number") decimals = d;
          else if (d && typeof d.toString === "function") decimals = Number(d.toString());
        } catch (e) {
          // fallback
        }

        // amountSmallest as string (valueBI)
        const amountSmallest = valueBI.toString();

        // create transaction row
        await prisma.transaction.create({
          data: {
            userId: userWallet.userId,
            fundId: null,
            type: "Deposit",
            amount: amountSmallest,
            tokenSymbol: null,
            tokenAddress: tokenAddress,
            txHash,
            from: fromAddr,
            to: DEPOSIT_ADDR,
            status: "SUCCESS",
          },
        });

        // add to user's balance (balanceWei stored as Decimal string smallest unit)
        const user = await prisma.user.findUnique({ where: { id: userWallet.userId } });
        const prev = user?.balanceWei ? BigInt(user.balanceWei.toString()) : BigInt(0);
        const next = prev + BigInt(amountSmallest);
        await prisma.user.update({
          where: { id: userWallet.userId },
          data: { balanceWei: next.toString() },
        });

        foundCount++;
      } catch (err) {
        console.error("Error processing log", err);
      }
    } // end logs

    // 2) Handle native ETH transfers: scan tx hashes in blocks from fromBlock..toBlock
    for (let b = fromBlock; b <= toBlock; b++) {
      const block = await provider.getBlock(b); // returns tx hashes array
      if (!block || !block.transactions) continue;
      for (const txHash of block.transactions) {
        try {
          const tx = await provider.getTransaction(txHash);
          if (!tx) continue;
          if (!tx.to) continue;
          if ((tx.to || "").toLowerCase() !== DEPOSIT_ADDR) continue;
          const fromAddr = (tx.from || "").toLowerCase();

          // ignore 0 value
          const amountSmallest = toBigIntSafe(tx.value?.toString() ?? "0").toString();
          if (amountSmallest === "0") continue;

          // find user by userWallet.address === fromAddr
          const userWallet = await prisma.userWallet.findFirst({
            where: { address: fromAddr },
            include: { user: true },
          });
          if (!userWallet) continue;

          const txHash = tx.hash;

          const exist = await prisma.transaction.findFirst({ where: { txHash } });
          if (exist) continue;

          await prisma.transaction.create({
            data: {
              userId: userWallet.userId,
              fundId: null,
              type: "Deposit",
              amount: amountSmallest,
              tokenSymbol: "ETH",
              tokenAddress: null,
              txHash,
              from: fromAddr,
              to: DEPOSIT_ADDR,
              status: "SUCCESS",
            },
          });

          const user = await prisma.user.findUnique({ where: { id: userWallet.userId } });
          const prev = user?.balanceWei ? BigInt(user.balanceWei.toString()) : BigInt(0);
          const next = prev + BigInt(amountSmallest);
          await prisma.user.update({
            where: { id: userWallet.userId },
            data: { balanceWei: next.toString() },
          });

          foundCount++;
        } catch (err) {
          // ignore single tx errors
        }
      }
    }

    // update last scanned block to toBlock
    await writeLastBlock(toBlock);
    return { scannedFrom: fromBlock, scannedTo: toBlock, found: foundCount };
  } catch (err) {
    console.error("scanDeposits error:", err);
    return { scannedFrom: fromBlock, scannedTo: toBlock, found: foundCount, error: String(err) };
  }
}
