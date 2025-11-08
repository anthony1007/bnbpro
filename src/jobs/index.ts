// /**
//  * src/jobs/index.ts
//  */
// import prisma from "@/lib/prisma";
// import scanDeposits from "./scanDeposits";
// import processWithdraws from "./processWithdraws";

// const INTERVAL = Number(process.env.JOB_POLL_INTERVAL || "15000");

// async function sleep(ms: number) {
//   return new Promise((res) => setTimeout(res, ms));
// }

// (async () => {
//   console.log("Jobs worker started");
//   await prisma.$connect();

//   while (true) {
//     try {
//       const res = await scanDeposits();
//       console.log("scanDeposits result:", res);
//     } catch (err) {
//       console.error("scanDeposits failed:", err);
//     }

//     try {
//       const res = await processWithdraws();
//       console.log("processWithdraws result:", res);
//     } catch (err) {
//       console.error("processWithdraws failed:", err);
//     }

//     await sleep(INTERVAL);
//   }
// })();




// src/jobs/index.ts
/**
 * Simple job runner:
 * - runs scanDeposits()
 * - runs processWithdraws()
 * - sleeps JOB_POLL_INTERVAL (ms)
 *
 * Run with: npx tsx src/jobs/index.ts
 */

import scanDeposits from "./scanDeposits";
import processWithdraws from "./processWithdraws";

const INTERVAL = Number(process.env.JOB_POLL_INTERVAL || "15000");

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

(async () => {
  console.log("Jobs worker started");
  while (true) {
    try {
      const res = await scanDeposits();
      console.log("scanDeposits result:", res);
    } catch (err) {
      console.error("scanDeposits failed:", err);
    }

    try {
      const res2 = await processWithdraws();
      console.log("processWithdraws result:", res2);
    } catch (err) {
      console.error("processWithdraws failed:", err);
    }

    await sleep(INTERVAL);
  }
})();
