// import { ethers } from "ethers";
// import Decimal from "decimal.js";
// import prisma from "../lib/prisma";
// import dotenv from "dotenv";
// dotenv.config();

// const RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org/";
// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const START_BLOCK = Number(process.env.START_BLOCK || 38000000);
// const BATCH_SIZE = 10;

// const TOKEN_ADDRESSES = [
//   process.env.USDT_CONTRACT?.toLowerCase(),
//   process.env.USDC_CONTRACT?.toLowerCase(),
// ].filter(Boolean) as string[];

// const TRANSFER_TOPIC =
//   "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// export default async function scanDeposits() {
//   console.log("🚀 Deposit scanner started...");
//   let latest = await provider.getBlockNumber();
//   let fromBlock = START_BLOCK;
//   let toBlock = fromBlock + BATCH_SIZE;

//   while (true) {
//     latest = await provider.getBlockNumber();
//     if (fromBlock > latest) {
//       console.log("✅ Up to date. Waiting...");
//       await sleep(10_000);
//       continue;
//     }

//     toBlock = Math.min(fromBlock + BATCH_SIZE, latest);
//     console.log(`🔍 Scanning blocks [${fromBlock} → ${toBlock}]...`);

//     try {
//       await processBlocks(fromBlock, toBlock);
//     } catch (err) {
//       console.error("❌ Error in processBlocks:", err);
//     }

//     fromBlock = toBlock + 1;
//   }
// }

// async function sleep(ms: number) {
//   return new Promise((r) => setTimeout(r, ms));
// }

// async function processBlocks(fromBlock: number, toBlock: number) {
//   for (let blockNum = fromBlock; blockNum <= toBlock; blockNum++) {
//     const block = await provider.getBlock(blockNum, true);
//     if (!block?.transactions?.length) continue;

//     // Process transactions - ethers v6 returns readonly string[]
//     await processTransactionHashes([...block.transactions]);
//   }
// }

// async function processTransactionHashes(txHashes: readonly string[]) {
//   for (const txHash of txHashes) {
//     try {
//       // Fetch full transaction object from hash (ethers v6 pattern)
//       const fullTx = await provider.getTransaction(txHash);
//       if (fullTx) {
//         await handleTransaction(fullTx);
//       }
//     } catch (err) {
//       console.error(`⚠️ Error processing transaction ${txHash}:`, err);
//     }
//   }
// }

// async function handleTransaction(tx: ethers.TransactionResponse) {
//   if (!tx.to) return;
//   const toAddr = tx.to.toLowerCase();

//   const deposit =
//   (await prisma.depositAddress.findUnique({
//     where: { address: toAddr },
//   })) ||
//   (await prisma.userWallet.findUnique({
//     where: { address: toAddr },
//   }));

//   if (!deposit) return;

//   const userId = deposit.userId;
//   const txHash = tx.hash;

//   const exists = await prisma.transaction.findUnique({ where: { txHash } });
//   if (exists) return;

//   const receipt = await provider.getTransactionReceipt(txHash);

//   // Fix: Check if receipt is not null before using it
//   if (!receipt) {
//     console.log(`⚠️ No receipt found for tx ${txHash}`);
//     return;
//   }

//   // native BNB
//   if (tx.value && tx.value > 0n) {
//     const amountDecimal = new Decimal(ethers.formatEther(tx.value));
//     await creditUser(userId, txHash, amountDecimal, "BNB", null, tx.from, tx.to);
//   }

//   // token transfer logs
//   for (const log of receipt.logs) {
//     if (log.topics[0] !== TRANSFER_TOPIC) continue;
//     if (!TOKEN_ADDRESSES.includes(log.address.toLowerCase())) continue;

//     const from = "0x" + log.topics[1].slice(26);
//     const to = "0x" + log.topics[2].slice(26);
//     if (to.toLowerCase() !== toAddr) continue;

//     const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data);
//     const amount = ethers.formatUnits(decoded[0], 18);
//     const amountDecimal = new Decimal(amount);

//     const tokenAddr = log.address.toLowerCase();
//     const symbol =
//       tokenAddr === process.env.USDT_CONTRACT?.toLowerCase() ? "USDT" : "USDC";

//     await creditUser(userId, txHash, amountDecimal, symbol, tokenAddr, from, to);
//       }
// }

// async function creditUser(
//   userId: number,
//   txHash: string,
//   amount: Decimal,
//   tokenSymbol: string,
//   tokenAddress: string | null,
//   from?: string,
//   to?: string
// ) {
//   await prisma.$transaction(async (txc) => {
//     await txc.transaction.create({
//       data: {
//         userId,
//         type: "Deposit",
//         amount,
//         tokenSymbol,
//         tokenAddress,
//         txHash,
//         from,
//         to,
//         status: "SUCCESS",
//         network: "bsc",
//       },
//     });

//     await txc.user.update({
//       where: { id: userId },
//       data: { balanceWei: { increment: amount } },
//     });
//   });

//   console.log(`✅ Credited ${amount} ${tokenSymbol} to user ${userId}`);
// }



// import { ethers } from "ethers";
// import Decimal from "decimal.js";
// import prisma from "../lib/prisma";
// import dotenv from "dotenv";
// dotenv.config();

// const RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org/";
// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const START_BLOCK = Number(process.env.START_BLOCK || 38000000);
// const BATCH_SIZE = 10;

// const USDT_CONTRACT = process.env.USDT_CONTRACT?.toLowerCase();
// const USDC_CONTRACT = process.env.USDC_CONTRACT?.toLowerCase();

// const TOKEN_ADDRESSES = [
//   USDT_CONTRACT,
//   USDC_CONTRACT,
// ].filter(Boolean) as string[];

// const TRANSFER_TOPIC =
//   "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// export default async function scanDeposits() {
//   console.log("🚀 Deposit scanner started...");
//   console.log(`📍 Starting from block: ${START_BLOCK}`);
//   console.log(`💰 USDT_CONTRACT: ${USDT_CONTRACT}`);
//   console.log(`💵 USDC_CONTRACT: ${USDC_CONTRACT}`);
//   console.log(`🔍 BSC RPC: ${RPC_URL}`);

//   // Test database connection
//   try {
//     const depositCount = await prisma.depositAddress.count();
//     console.log(`🗄️ Total deposit addresses in DB: ${depositCount}`);
    
//     if (depositCount === 0) {
//       console.log("⚠️ WARNING: No deposit addresses found in database!");
//     }
//   } catch (err) {
//     console.error("❌ Database connection error:", err);
//     return;
//   }

//   let latest = await provider.getBlockNumber();
//   let fromBlock = START_BLOCK;
//   let toBlock = fromBlock + BATCH_SIZE;

//   while (true) {
//     latest = await provider.getBlockNumber();
//     if (fromBlock > latest) {
//       console.log("✅ Up to date. Waiting...");
//       await sleep(10_000);
//       continue;
//     }

//     toBlock = Math.min(fromBlock + BATCH_SIZE, latest);
//     console.log(`🔍 Scanning blocks [${fromBlock} → ${toBlock}]...`);

//     try {
//       await processBlocks(fromBlock, toBlock);
//     } catch (err) {
//       console.error("❌ Error in processBlocks:", err);
//     }

//     fromBlock = toBlock + 1;
//   }
// }

// async function sleep(ms: number) {
//   return new Promise((r) => setTimeout(r, ms));
// }

// async function processBlocks(fromBlock: number, toBlock: number) {
//   for (let blockNum = fromBlock; blockNum <= toBlock; blockNum++) {
//     try {
//       const block = await provider.getBlock(blockNum, true);
//       if (!block) {
//         console.log(`⚠️ Block ${blockNum} not found`);
//         continue;
//       }

//       if (!block.transactions || block.transactions.length === 0) {
//         console.log(`📭 Block ${blockNum} has no transactions`);
//         continue;
//       }

//       console.log(`📦 Block ${blockNum} has ${block.transactions.length} transactions`);
      
//       // Process transactions - ethers v6 returns readonly string[]
//       await processTransactionHashes([...block.transactions], blockNum);
      
//     } catch (err) {
//       console.error(`❌ Error fetching block ${blockNum}:`, err);
//     }
//   }
// }

// async function processTransactionHashes(txHashes: readonly string[], blockNum: number) {
//   let processedCount = 0;
  
//   for (const txHash of txHashes) {
//     try {
//       // Fetch full transaction object from hash (ethers v6 pattern)
//       const fullTx = await provider.getTransaction(txHash);
//       if (fullTx) {
//         const processed = await handleTransaction(fullTx);
//         if (processed) {
//           processedCount++;
//         }
//       }
//     } catch (err) {
//       console.error(`⚠️ Error processing transaction ${txHash}:`, err);
//     }
//   }
  
//   if (processedCount > 0) {
//     console.log(`✅ Processed ${processedCount} relevant transactions in block ${blockNum}`);
//   }
// }

// async function handleTransaction(tx: ethers.TransactionResponse) {
//   console.log(`🔍 Checking transaction: ${tx.hash}`);
//   console.log(`   From: ${tx.from}`);
//   console.log(`   To: ${tx.to}`);
//   console.log(`   Value: ${ethers.formatEther(tx.value)} BNB`);
  
//   if (!tx.to) {
//     console.log("   ❌ No 'to' address - skipping");
//     return false;
//   }

//   const toAddr = tx.to.toLowerCase();
//   console.log(`   🎯 Looking for deposit address: ${toAddr}`);

//   const deposit = await prisma.depositAddress.findUnique({
//     where: { address: toAddr },
//   });
  
//   if (!deposit) {
//     console.log("   ❌ No matching deposit address in database");
//     return false;
//   }

//   console.log(`✅ Found deposit address for userId: ${deposit.userId}`);
//   const userId = deposit.userId;
//   const txHash = tx.hash;

//   const exists = await prisma.transaction.findUnique({ where: { txHash } });
//   if (exists) {
//     console.log(`   ⚠️ Transaction ${txHash} already processed`);
//     return false;
//   }

//   console.log(`   📝 Creating transaction record for user ${userId}`);
//   const receipt = await provider.getTransactionReceipt(txHash);

//   // Fix: Check if receipt is not null before using it
//   if (!receipt) {
//     console.log(`   ⚠️ No receipt found for tx ${txHash} - transaction might still be pending`);
//     return false;
//   }

//   let credited = false;

//   // native BNB
//   if (tx.value && tx.value > 0n) {
//     const amountDecimal = new Decimal(ethers.formatEther(tx.value));
//     console.log(`   💰 Native BNB deposit: ${amountDecimal} BNB`);
//     await creditUser(userId, txHash, amountDecimal, "BNB", null, tx.from, tx.to);
//     credited = true;
//   }

//   // token transfer logs
//   console.log(`   🔄 Processing ${receipt.logs.length} logs`);
  
//   for (let i = 0; i < receipt.logs.length; i++) {
//     const log = receipt.logs[i];
    
//     if (log.topics[0] !== TRANSFER_TOPIC) {
//       console.log(`   📝 Log ${i}: Not a transfer event`);
//       continue;
//     }

//     console.log(`   📝 Log ${i}: Transfer event found`);
    
//     const tokenAddr = log.address.toLowerCase();
//     console.log(`   🪙 Token contract: ${tokenAddr}`);
    
//     if (!TOKEN_ADDRESSES.includes(tokenAddr)) {
//       console.log(`   ❌ Token ${tokenAddr} not in our list`);
//       continue;
//     }

//     console.log(`   ✅ Found token transfer for ${tokenAddr}`);

//     const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
//       ["address", "address", "uint256"],
//       log.data
//     );
    
//     const to = "0x" + log.topics[2].slice(26);
//     console.log(`   🎯 Log recipient: ${to}`);
//     console.log(`   🎯 Target address: ${toAddr}`);
    
//     if (to.toLowerCase() !== toAddr) {
//       console.log(`   ❌ Recipient doesn't match target address`);
//       continue;
//     }

//     const amount = ethers.formatUnits(decoded[2], 18);
//     const amountDecimal = new Decimal(amount);
//     const symbol = tokenAddr === USDT_CONTRACT ? "USDT" : tokenAddr === USDC_CONTRACT ? "USDC" : "UNKNOWN";

//     console.log(`   💰 Token deposit: ${amountDecimal} ${symbol}`);
//     await creditUser(userId, txHash, amountDecimal, symbol, tokenAddr, tx.from, to);
//     credited = true;
//   }

//   if (!credited) {
//     console.log(`   ⚠️ No credits processed for transaction ${txHash}`);
//   }

//   return credited;
// }

// async function creditUser(
//   userId: number,
//   txHash: string,
//   amount: Decimal,
//   tokenSymbol: string,
//   tokenAddress: string | null,
//   from?: string,
//   to?: string
// ) {
//   try {
//     await prisma.$transaction(async (txc) => {
//       await txc.transaction.create({
//         data: {
//           userId,
//           type: "Deposit",
//           amount,
//           tokenSymbol,
//           tokenAddress,
//           txHash,
//           from,
//           to,
//           status: "SUCCESS",
//           network: "bsc",
//         },
//       });

//       await txc.user.update({
//         where: { id: userId },
//         data: { balanceWei: { increment: amount } },
//       });
//     });

//     console.log(`✅ Credited ${amount} ${tokenSymbol} to user ${userId}`);
//     console.log(`   📊 Transaction hash: ${txHash}`);
    
//   } catch (err) {
//     console.error(`❌ Failed to credit user ${userId}:`, err);
//   }
// }



// import { ethers } from "ethers";
// import Decimal from "decimal.js";
// import prisma from "../lib/prisma";
// import dotenv from "dotenv";
// dotenv.config();

// const RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org/";
// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const START_BLOCK = Number(process.env.START_BLOCK || 38000000);
// const BATCH_SIZE = 10;

// const USDT_CONTRACT = process.env.USDT_CONTRACT?.toLowerCase();
// const USDC_CONTRACT = process.env.USDC_CONTRACT?.toLowerCase();

// const TOKEN_ADDRESSES = [USDT_CONTRACT, USDC_CONTRACT].filter(Boolean) as string[];

// const TRANSFER_TOPIC =
//   "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// export default async function scanDeposits() {
//   console.log("🚀 Deposit scanner started...");
//   console.log(`📍 Starting from block: ${START_BLOCK}`);

//   let latest = await provider.getBlockNumber();
//   let fromBlock = START_BLOCK;
//   let toBlock = fromBlock + BATCH_SIZE;

//   while (true) {
//     latest = await provider.getBlockNumber();
//     if (fromBlock > latest) {
//       console.log("✅ Up to date. Waiting...");
//       await sleep(10_000);
//       continue;
//     }

//     toBlock = Math.min(fromBlock + BATCH_SIZE, latest);
//     console.log(`🔍 Scanning blocks [${fromBlock} → ${toBlock}]...`);

//     try {
//       await processBlocks(fromBlock, toBlock);
//     } catch (err) {
//       console.error("❌ Error in processBlocks:", err);
//     }

//     fromBlock = toBlock + 1;
//   }
// }

// async function sleep(ms: number) {
//   return new Promise((r) => setTimeout(r, ms));
// }

// async function processBlocks(fromBlock: number, toBlock: number) {
//   for (let blockNum = fromBlock; blockNum <= toBlock; blockNum++) {
//     const block = await provider.getBlock(blockNum, true);
//     if (!block?.transactions?.length) continue;
//     await processTransactionHashes([...block.transactions], blockNum);
//   }
// }

// async function processTransactionHashes(txHashes: readonly string[], blockNum: number) {
//   for (const txHash of txHashes) {
//     try {
//       const tx = await provider.getTransaction(txHash);
//       if (tx) await handleTransaction(tx);
//     } catch (err) {
//       console.error(`⚠️ Error processing ${txHash}:`, err);
//     }
//   }
// }

// async function handleTransaction(tx: ethers.TransactionResponse) {
//   if (!tx.to) return false;
//   const toAddr = tx.to.toLowerCase();

//   // ✅ Bây giờ scanner sẽ tìm trong bảng UserWallet
//   const wallet = await prisma.userWallet.findUnique({
//     where: { address: toAddr },
//   });
//   if (!wallet) return false;

//   const userId = wallet.userId;
//   const txHash = tx.hash;

//   const exists = await prisma.transaction.findUnique({ where: { txHash } });
//   if (exists) return false;

//   const receipt = await provider.getTransactionReceipt(txHash);
//   if (!receipt) return false;

//   let credited = false;

//   // BNB deposit
//   if (tx.value && tx.value > 0n) {
//     const amountDecimal = new Decimal(ethers.formatEther(tx.value));
//     await creditUser(userId, txHash, amountDecimal, "BNB", null, tx.from, tx.to);
//     credited = true;
//   }

//   // Token transfers
//   for (const log of receipt.logs) {
//     if (log.topics[0] !== TRANSFER_TOPIC) continue;
//     if (!TOKEN_ADDRESSES.includes(log.address.toLowerCase())) continue;

//     const tokenAddr = log.address.toLowerCase();
//     const from = "0x" + log.topics[1].slice(26);
//     const to = "0x" + log.topics[2].slice(26);
//     if (to.toLowerCase() !== toAddr) continue;

//     const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data);
//     const amount = ethers.formatUnits(decoded[0], 18);
//     const amountDecimal = new Decimal(amount);

//     const symbol =
//       tokenAddr === USDT_CONTRACT ? "USDT" : tokenAddr === USDC_CONTRACT ? "USDC" : "UNKNOWN";

//     await creditUser(userId, txHash, amountDecimal, symbol, tokenAddr, from, to);
//     credited = true;
//   }

//   if (credited) console.log(`✅ Credited tx ${txHash} for user ${userId}`);
//   return credited;
// }

// async function creditUser(
//   userId: number,
//   txHash: string,
//   amount: Decimal,
//   tokenSymbol: string,
//   tokenAddress: string | null,
//   from?: string,
//   to?: string
// ) {
//   await prisma.$transaction(async (txc) => {
//     await txc.transaction.create({
//       data: {
//         userId,
//         type: "Deposit",
//         amount,
//         tokenSymbol,
//         tokenAddress,
//         txHash,
//         from,
//         to,
//         status: "SUCCESS",
//         network: "bsc",
//       },
//     });

//     await txc.user.update({
//       where: { id: userId },
//       data: { balanceWei: { increment: amount } },
//     });
//   });

//   console.log(`💰 ${amount} ${tokenSymbol} → user ${userId}`);
// }


// scripts/scanDeposits.ts
import { ethers } from "ethers";
import Decimal from "decimal.js";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

// ✅ RPC Sepolia testnet
const RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";

// ✅ Khởi tạo provider Sepolia
const provider = new ethers.JsonRpcProvider(RPC_URL);

// ✅ Bắt đầu quét từ block này
const START_BLOCK = Number(process.env.START_BLOCK || 7090000);
const BATCH_SIZE = 10;

console.log("🚀 Sepolia ETH Deposit Scanner started...");
console.log(`📍 RPC: ${RPC_URL}`);
console.log(`📍 Starting from block: ${START_BLOCK}`);

export default async function scanDeposits() {
  let latest = await provider.getBlockNumber();
  let fromBlock = START_BLOCK;
  let toBlock = fromBlock + BATCH_SIZE;

  while (true) {
    latest = await provider.getBlockNumber();
    if (fromBlock > latest) {
      console.log("✅ Up to date. Waiting 10s...");
      await sleep(10_000);
      continue;
    }

    toBlock = Math.min(fromBlock + BATCH_SIZE, latest);
    console.log(`🔍 Scanning blocks [${fromBlock} → ${toBlock}]...`);

    try {
      await processBlocks(fromBlock, toBlock);
    } catch (err) {
      console.error("❌ Error in processBlocks:", err);
    }

    fromBlock = toBlock + 1;
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function processBlocks(fromBlock: number, toBlock: number) {
  for (let blockNum = fromBlock; blockNum <= toBlock; blockNum++) {
    const block = await provider.getBlock(blockNum, true);
    if (!block?.transactions?.length) continue;
    await processTransactions(block.transactions, blockNum);
  }
}

async function processTransactions(txs: readonly string[], blockNum: number) {
  for (const txHash of txs) {
    try {
      const tx = await provider.getTransaction(txHash);
      if (tx) await handleTransaction(tx);
    } catch (err) {
      console.error(`⚠️ Error processing ${txHash}:`, err);
    }
  }
}

async function handleTransaction(tx: ethers.TransactionResponse) {
  if (!tx.to) return;

  const toAddr = tx.to.toLowerCase();

  console.log(
    `🔍 Checking transaction: ${tx.hash}\n   From: ${tx.from}\n   To: ${tx.to}\n   Value: ${ethers.formatEther(
      tx.value
    )} ETH`
  );

  // ✅ Tìm userWallet không phân biệt hoa/thường
  const wallet = await prisma.userWallet.findFirst({
    where: {
      address: {
        equals: toAddr,
        mode: "insensitive",
      },
    },
  });

  console.log(
    `   🎯 Looking for user wallet address: ${toAddr} ${
      wallet ? "✅ FOUND" : "❌ NOT FOUND"
    }`
  );

  if (!wallet) return false;

  const userId = wallet.userId;
  const txHash = tx.hash;

  // Kiểm tra trùng tx
  const exists = await prisma.transaction.findUnique({ where: { txHash } });
  if (exists) return false;

  // Chỉ xử lý native ETH deposit
  if (tx.value > 0n) {
    const amountEth = ethers.formatEther(tx.value);
    const amountDecimal = new Prisma.Decimal(amountEth);
    console.log(`🚨 Native deposit detected! Value: ${amountEth} ETH`);

    await creditUser(userId, txHash, amountDecimal, tx.from, tx.to);
    console.log(`💰 ${amountEth} ETH → credited to user ${userId}`);
  }

  return true;
}

async function creditUser(
  userId: number,
  txHash: string,
  amount: Prisma.Decimal,
  from?: string,
  to?: string
) {
  await prisma.$transaction(async (txc) => {
    await txc.transaction.create({
      data: {
        userId,
        type: "Deposit",
        amount,
        tokenSymbol: "ETH",
        tokenAddress: null,
        txHash,
        from,
        to,
        status: "SUCCESS",
        network: "sepolia",
      },
    });

    await txc.user.update({
      where: { id: userId },
      data: { balanceWei: { increment: amount } },
    });
  });
}

// ✅ Chạy script
if (require.main === module) {
  scanDeposits().catch(console.error);
}
