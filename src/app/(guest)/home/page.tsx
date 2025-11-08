// import React from "react";
// import { BsShieldFillCheck } from "react-icons/bs";
// import { BiSearchAlt } from "react-icons/bi";
// import { RiHeart2Fill } from "react-icons/ri";
// import { ServiceCardProps } from "@/types";
// import "@/app/layout";

// const ServiceCard = ({ color, title, icon, subtitle }: ServiceCardProps) => (
//   <div className="flex flex-row justify-center  items-center white-glassmorphism p-3 m-2 cursor-pointer hover:shadow-xl">
//     <div className={`w-10 h-10 rounded-full flex justify-center items-center ${color}`}>
//       {icon}
//     </div>
//     <div className="ml-5 flex flex-col flex-1">
//       <h3 className="mt-2 text-white text-lg">{title}</h3>
//       <p className="mt-1 text-white text-sm md:w-9/12">
//         {subtitle}
//       </p>
//     </div>
//   </div>
// );

// const commonStyles = "m-0 p-3 sm:min-h-[70px] sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-white"

// export default function GuestHome(){
//   return (      
//     <>
//       <div className="grid md:grid-cols-2 sm:grid-cols-1 items-center p-5 py-20">
//         <div className="justify-center items-center p-5">
//           <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1">
//             Send Crypto <br /> across the world
//           </h1>
//           <p className="text-left my-5 text-white font-light text-base">
//             Hello Anthony
//           </p>
//           <div className="grid grid-cols-3">
//             <div className={`rounded-tl-2xl ${commonStyles}`}>
//               Reliability
//             </div>
//             <div className={commonStyles}>Security</div>
//             <div className={`rounded-tr-2xl ${commonStyles}`}>
//               Ethereum
//             </div>
//             <div className={`rounded-bl-2xl ${commonStyles}`}>
//               Web 3.0
//             </div>
//             <div className={commonStyles}>Low fee</div>
//             <div className={`rounded-br-2xl ${commonStyles}`}>
//               Blockchain
//             </div>
//           </div>
//         </div>
//         <div className="justify-self-center items-center">
//           <div className="rounded-xl eth-card white-glassmorphism mt-5 p-5">
//             <div className="flex justify-between flex-col w-full h-full">
//               <div className="flex justify-between items-start">
//                 <div className="w-10 h-5 flex justify-center items-center">
//                   <img src="bnbf.png" alt="bnbfund_logo" width="39" color="#fff"/>
//                 </div>
//                 <img src="lquidpay.png" alt="lquidpay_logo" width="22" color="#fff" className="-mt-2"/>
//               </div>
//               <div className="text-center">
//                 <p className="text-black font-light text-sm">
//                   -----*****-----
//                 </p>
//                 <p className="text-black font-semibold text-md mt-1">
//                   Cash & Cryptocurrency Payments
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="grid md:grid-cols-2 sm:grid-cols-1 items-center p-5">
//         <div className="justify-center items-center p-5">
//           <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1">
//             Send Crypto <br /> across the world
//           </h1>
//           <p className="text-left mt-5 text-white font-light text-base">
//             Hello Anthony
//           </p>
//         </div>
//         <div className="justify-center items-center p-2">
//           <ServiceCard
//             color="bg-[#2952E3]"
//             title="Security gurantee"
//             icon={<BsShieldFillCheck fontSize={21} className="text-white justify-self-center items-center" />}
//             subtitle="Security is guranteed. We always maintain privacy and maintain the quality of our products"
//           />
//           <ServiceCard
//             color="bg-[#8945F8]"
//             title="Best exchange rates"
//             icon={<BiSearchAlt fontSize={21} className="text-white" />}
//             subtitle="Security is guranteed. We always maintain privacy and maintain the quality of our products"
//           />
//           <ServiceCard
//             color="bg-[#F84550]"
//             title="Fastest transactions"
//             icon={<RiHeart2Fill fontSize={21} className="text-white" />}
//             subtitle="Security is guranteed. We always maintain privacy and maintain the quality of our products"
//           />
//         </div>
//       </div>
//     </>
//   );
// }



// src/app/guest/home/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaRobot, FaBolt, FaArrowRight } from "react-icons/fa";
import { THEME } from "@/lib/theme";
import "@/app/layout";

/**
 * Landing page for BNBFund (Guest / Home)
 * - Next.js 16 App Router
 * - TypeScript
 * - Tailwind v4 (make sure tailwind config includes custom colors or use inline styles)
 * - Framer Motion v12 for subtle animations
 *
 * Notes:
 * - Replace images in /public/images/ (hero.jpg, feature-ai.jpg, feature-secure.jpg, plan-1.jpg, plan-2.jpg, plan-3.jpg)
 * - Investment plan CTA buttons link to /bnbfund
 */

const highlight = { color: THEME.accent };

const PlanCard: React.FC<{
  title: string;
  price: string;
  returnText: string;
  bullets: string[];
  href?: string;
  image?: string;
}> = ({ title, price, returnText, bullets, href = "/bnbfund", image }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="w-full sm:w-[320px] bg-linear-to-b from-[#0E1013] to-[#080A0D] border border-[#2B3139] rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="h-66 overflow-hidden">
        <img
          src={image ?? "/angel.png"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-bnb-yellow">{title}</h3>
          <div className="text-xl font-extrabold text-[#FCD535]">${price}</div>
        </div>
        <p className="text-sm text-gray-400 mt-2">{returnText}</p>
        <ul className="mt-3 text-sm text-gray-300 space-y-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-300 font-bold">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <a href={href} className="inline-block mt-4 w-full">
          <button className="w-full py-2 rounded-lg bg-linear-to-r from-[#E0B90B] to-[#FCD535] text-black font-semibold shadow-md hover:brightness-95 flex items-center justify-center gap-2">
            Invest / View
            <FaArrowRight />
          </button>
        </a>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  return (
    <main className="pt-20 min-h-screen" style={{ background: THEME.bg, color: THEME.text }}>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-extrabold leading-tight"
          >
            Professional, AI-driven <span style={highlight}>crypto investment</span> for modern investors.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-5 text-gray-300 max-w-xl"
          >
            BNBFund combines advanced machine learning, on-chain signals and institutional-grade risk controls
            to deliver consistent returns in crypto markets. Built for security-first investors who expect clarity,
            automation and performance.
          </motion.p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <a href="/bnbfund" className="inline-block">
              <button className="px-6 py-3 rounded-lg bg-linear-to-r from-[#E0B90B] to-[#FCD535] font-semibold text-black shadow-lg">
                Explore Investment Plans
              </button>
            </a>
            <a href="/about" className="inline-block">
              <button className="px-6 py-3 rounded-lg border border-[#2B3139] text-gray-200">
                Learn how it works
              </button>
            </a>
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FaRobot className="text-yellow-400" /> <span>AI-managed strategies</span>
            </div>
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-green-400" /> <span>Security & on-chain transparency</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBolt className="text-purple-400" /> <span>Optimized execution</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden border border-[#2B3139] shadow-xl"
          >
            <img src="reward.png" alt="AI Crypto" className="w-full max-h-119 object-cover" />
            
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: THEME.accent }}>Why BNBFund?</h2>
            <p className="mt-4 text-gray-300 leading-relaxed">
              BNBFund is designed to bring institutional-grade investment products to the crypto space.
              Our AI engine analyzes market structure, on-chain flows and macro signals to allocate capital across
              assets with risk-aware position sizing. You keep transparency: every deposit, profit distribution and
              withdrawal is tracked and logged.
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3 text-gray-300">
                <span className="bg-[#111418] p-2 rounded-md border border-[#2B3139]">
                  <FaShieldAlt className="text-green-400" />
                </span>
                <div>
                  <div className="font-semibold">Security-first</div>
                  <div className="text-sm text-gray-400">Cold key management, audited contracts, role-based admin.</div>
                </div>
              </li>

              <li className="flex items-start gap-3 text-gray-300">
                <span className="bg-[#111418] p-2 rounded-md border border-[#2B3139]">
                  <FaRobot className="text-yellow-400" />
                </span>
                <div>
                  <div className="font-semibold">AI-driven strategies</div>
                  <div className="text-sm text-gray-400">Adaptive models that aim to capture market opportunity with reduced drawdown.</div>
                </div>
              </li>

              <li className="flex items-start gap-3 text-gray-300">
                <span className="bg-[#111418] p-2 rounded-md border border-[#2B3139]">
                  <FaBolt className="text-purple-400" />
                </span>
                <div>
                  <div className="font-semibold">Transparency & Reporting</div>
                  <div className="text-sm text-gray-400">Investors can view deposits, balances and historical transactions. Monthly reports and on-chain proofs available.</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#2B3139] shadow-xl">
            <img src="static.png" alt="AI" className="w-full max-h-119 object-cover" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold" style={{ color: THEME.accent }}>Core Features</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 bg-[#111418] rounded-xl border border-[#2B3139]">
            <div className="flex items-center gap-3">
              <div className="bg-[#0B0E11] p-3 rounded-md border border-[#2B3139]">
                <FaRobot className="text-yellow-400" />
              </div>
              <div>
                <div className="font-semibold">AI Allocation</div>
                <div className="text-sm text-gray-400">Model-driven allocations, continuous rebalancing.</div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#111418] rounded-xl border border-[#2B3139]">
            <div className="flex items-center gap-3">
              <div className="bg-[#0B0E11] p-3 rounded-md border border-[#2B3139]">
                <FaShieldAlt className="text-green-400" />
              </div>
              <div>
                <div className="font-semibold">Secure Custody</div>
                <div className="text-sm text-gray-400">Hardware-backed keys & multi-sig for core wallets.</div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#111418] rounded-xl border border-[#2B3139]">
            <div className="flex items-center gap-3">
              <div className="bg-[#0B0E11] p-3 rounded-md border border-[#2B3139]">
                <FaBolt className="text-purple-400" />
              </div>
              <div>
                <div className="font-semibold">Fast Execution</div>
                <div className="text-sm text-gray-400">Optimized trade routing & gas-aware execution.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INVESTMENT PLANS */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold" style={{ color: THEME.accent }}>Investment Plans</h2>
        <p className="text-gray-400 mt-2">Three curated plans to match risk appetite and time horizon. Click to view and invest.</p>

        <div className="mt-6 flex justify-center flex-col sm:flex-row gap-6">
          <PlanCard
            title="Starter Plan"
            price="250"
            returnText="Conservative, steady daily yield"
            bullets={["Low volatility", "Daily payouts", "Capital-protected logic"]}
            image="/pak1.png"
          />
          <PlanCard
            title="Growth Plan"
            price="1,000"
            returnText="Balanced risk / reward for medium-term investors"
            bullets={["AI rebalancing", "Moderate exposure", "Monthly insights"]}
            image="/pak2.png"
          />
          <PlanCard
            title="Pro Plan"
            price="5,000"
            returnText="High-conviction strategies for alpha capture"
            bullets={["Aggressive alpha", "Priority liquidity", "Dedicated support"]}
            image="/pak3.png"
          />
        </div>
      </section>

      {/* ROADMAP */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold" style={{ color: THEME.accent }}>Roadmap</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 bg-[#111418] rounded-xl border border-[#2B3139]">
            <div className="font-semibold">Q1 2026</div>
            <div className="text-sm text-gray-400 mt-2">BNBF Token launch & governance framework.</div>
          </div>
          <div className="p-5 bg-[#111418] rounded-xl border border-[#2B3139]">
            <div className="font-semibold">Q3 2026</div>
            <div className="text-sm text-gray-400 mt-2">BNBCard release: spend crypto with benefits & staking rewards.</div>
          </div>
          <div className="p-5 bg-[#111418] rounded-xl border border-[#2B3139]">
            <div className="font-semibold">Ongoing</div>
            <div className="text-sm text-gray-400 mt-2">Continuous AI upgrades, more regional launches & partner integrations.</div>
          </div>
        </div>
      </section>

      {/* CONTACT / FOOTER */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="p-6 bg-[#0C0F12] rounded-2xl border border-[#2B3139] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: THEME.accent }}>Get in touch</h3>
            <p className="text-gray-400 mt-2">
              To open support ticket or request partnership info, please <a href="/login" className="text-yellow-400 underline">log in</a>.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/login">
              <button className="px-5 py-3 rounded-lg border border-[#2B3139] bg-[#111418] text-gray-200">Login</button>
            </a>
            <a href="/register">
              <button className="px-5 py-3 rounded-lg bg-linear-to-r from-[#E0B90B] to-[#FCD535] text-black">Create account</button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
