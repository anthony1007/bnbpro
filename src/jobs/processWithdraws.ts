// // src/jobs/processWithdraws.ts
// // Job: lấy các withdraw requests (Transaction.type = Withdraw, status = PENDING) và thực hiện on-chain payment
// // - sử dụng WITHDRAW_PRIVATE_KEY từ env
// // - hỗ trợ native ETH (no tokenAddress) và ERC20 token nếu tokenAddress present
// // - convert decimals: USDT 6, else try to read token decimals from chain

// import { ethers } from "ethers";
// import prisma from "@/lib/prisma";

// const RPC = process.env.RPC_URL || process.env.SEPOLIA_RPC || "";
// const WITHDRAW_PK = process.env.WITHDRAW_PRIVATE_KEY || "";
// if (!WITHDRAW_PK) {
//   console.warn("WITHDRAW_PRIVATE_KEY not set - withdraws will NOT be processed");
// }
// const provider = new ethers.JsonRpcProvider(RPC);
// const signer = WITHDRAW_PK ? new ethers.Wallet(WITHDRAW_PK, provider) : null;

// const ERC20_ABI = [
//   "function decimals() view returns (uint8)",
//   "function transfer(address to, uint256 amount) returns (bool)",
// ];

// async function processPending() {
//   if (!signer) {
//     console.warn("withdraw signer not configured");
//     return;
//   }

//   const pending = await prisma.transaction.findMany({
//     where: { type: "Withdraw", status: "PENDING" },
//     orderBy: { createdAt: "asc" },
//     take: 20,
//   });

//   if (!pending || pending.length === 0) {
//     // nothing to do
//     return;
//   }

//   for (const req of pending) {
//     try {
//       // parse amount (Decimal string) -> BigInt
//       const amountStr = String(req.amount ?? "0");
//       const tokenAddr = req.tokenAddress ?? null;
//       let txHash: string | null = null;

//       if (!tokenAddr) {
//         // native ETH
//         // amountStr currently decimal like "0.01" eth => convert to wei BigInt
//         const wei = ethers.parseUnits(amountStr, 18);
//         // build tx
//         const tx = await signer.sendTransaction({
//           to: req.to ?? undefined,
//           value: wei,
//           // gasLimit optional; ethers v6 estimates automatically
//         });
//         txHash = tx.hash;
//         await tx.wait();
//       } else {
//         // token transfer
//         const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
//         let decimals = 6; // default USDT
//         try {
//           decimals = Number(await token.decimals());
//         } catch (e) {
//           decimals = 6;
//         }
//         const amountBig = ethers.parseUnits(amountStr, decimals);
//         const tx = await token.transfer(req.to, amountBig);
//         txHash = tx.hash;
//         await tx.wait();
//       }

//       // update transaction
//       await prisma.transaction.update({
//         where: { id: req.id },
//         data: {
//           txHash,
//           status: "SUCCESS",
//           updatedAt: new Date(),
//         } as any,
//       });
//       console.log(`Processed withdraw ${req.id} tx ${txHash}`);
//     } catch (err: any) {
//       console.error("process withdraw error", req.id, err?.message ?? err);
//       // mark as failed with remarks
//       await prisma.transaction.update({
//         where: { id: req.id },
//         data: {
//           status: "FAILED",
//           // add remarks if schema has it - otherwise ignore
//           ...( ("remarks" in ({} as any)) ? { remarks: String(err?.message || "Withdraw failed") } : {} ),
//         } as any,
//       }).catch(()=>{});
//     }
//   }
// }

// export async function runProcessorOnce() {
//   try {
//     await processPending();
//   } catch (e) {
//     console.error("processPending error:", (e as Error).message);
//   }
// }

// if (require.main === module) {
//   (async () => {
//     console.log("Starting processWithdraws job...");
//     while (true) {
//       await processPending();
//       await new Promise((r) => setTimeout(r, 10_000));
//     }
//   })();
// }

// export default runProcessorOnce;


import { ethers } from "ethers";
import prisma from "@/lib/prisma";

const NETWORK = process.env.NETWORK || "sepolia";
const SEPOLIA_RPC = process.env.SEPOLIA_RPC || "";
const BSC_RPC = process.env.BSC_RPC || "";
const WITHDRAW_PK = process.env.WITHDRAW_PRIVATE_KEY || "";
const WITHDRAW_ADDR = (process.env.WITHDRAW_WALLET_ADDRESS || "").toLowerCase();

function providerForNetwork() {
  return NETWORK === "sepolia"
    ? new ethers.JsonRpcProvider(SEPOLIA_RPC)
    : new ethers.JsonRpcProvider(BSC_RPC);
}

export default async function processWithdraws() {
  console.log("[processWithdraws] start");
  if (!WITHDRAW_PK) {
    console.warn("[processWithdraws] Missing WITHDRAW_PRIVATE_KEY");
    return;
  }

  const provider = providerForNetwork();
  const signer = new ethers.Wallet(WITHDRAW_PK, provider);

  const pending = await prisma.transaction.findMany({
    where: { type: "Withdraw", status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  if (pending.length === 0) {
    console.log("[processWithdraws] No pending withdraws");
    return;
  }

  for (const tx of pending) {
    try {
      const amountSmallest = BigInt(tx.amount.toString()); // FIX: convert Decimal to BigInt
      console.log(`[processWithdraws] id=${tx.id} sending ${amountSmallest}`);

      let sentHash: string | null = null;
      if (tx.tokenAddress) {
        const token = new ethers.Contract(
          tx.tokenAddress,
          ["function transfer(address to,uint256 amount) returns (bool)"],
          signer
        );
        const resp = await token.transfer(tx.to, amountSmallest);
        console.log(`[processWithdraws] ERC20 sent tx: ${resp.hash}`);
        sentHash = resp.hash;
        await resp.wait();
      } else {
        const resp = await signer.sendTransaction({
          to: tx.to,
          value: amountSmallest,
        });
        console.log(`[processWithdraws] native sent tx: ${resp.hash}`);
        sentHash = resp.hash;
        await resp.wait();
      }

      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "SUCCESS", txHash: sentHash ?? tx.txHash, remarks: "Paid out" },
      });
    } catch (err: any) {
      console.error(`[processWithdraws] tx id=${tx.id} failed:`, err.message);
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "FAILED", remarks: err.message },
      });
    }
  }
}
