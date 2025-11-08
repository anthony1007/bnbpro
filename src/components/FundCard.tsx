"use client";

import { motion } from "framer-motion";
import { FaChartLine, FaCheckCircle, FaClock } from "react-icons/fa";
import { Button } from "./ui/button";

// 🔹 Định nghĩa an toàn cho Fund (tránh lỗi thiếu type)
export interface Fund {
  id: string;
  plan: string;
  package: number;
  perday?: number | null;
  quarter?: number | null;
  image?: { url?: string | null };
}

interface FundStatus {
  fundId: string;
  isPurchased?: boolean;
  totalClaimed?: number;
  nextClaimTime?: string | number | null;
  plan?: string;
}

interface FundCardProps {
  fund: Fund;
  status?: FundStatus;
  onBuy: () => void;
  onClaim: () => void;
}

export default function FundCard({
  fund,
  status,
  onBuy,
  onClaim,
}: FundCardProps) {
  const isPurchased = status?.isPurchased ?? false;
  const totalPercentage = fund.perday && fund.quarter
    ? (fund.perday * fund.quarter).toFixed(1)
    : "0";

  // 🔹 Chuyển đổi timestamp an toàn
  const nextClaimTime =
    status?.nextClaimTime && !isNaN(Number(status.nextClaimTime))
      ? new Date(Number(status.nextClaimTime))
      : null;

  const canClaim =
    isPurchased && (!nextClaimTime || Date.now() >= nextClaimTime.getTime());

  // 🔹 Đảm bảo link ảnh hợp lệ
  const imageUrl = fund.image?.url
    ? fund.image.url.startsWith("http")
      ? fund.image.url
      : fund.image.url.startsWith("/uploads/")
      ? fund.image.url
      : `/uploads/${fund.image.url}`
    : null;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative group w-[310px] max-sm:w-full 
        bg-linear-to-b from-[#111418] via-[#0E1013] to-[#080A0D]
        border border-[#1E2229] hover:border-[#FCD535]/50
        rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(252,213,53,0.05)]
        flex flex-col justify-between text-gray-200"
    >
      {/* Banner */}
      <div className="relative h-[260px] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={fund.plan || "Fund Image"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-gray-700/30 to-gray-900/50 flex items-center justify-center">
            <FaChartLine className="text-4xl text-gray-500 opacity-60" />
          </div>
        )}

        {isPurchased && (
          <span className="absolute top-3 right-3 bg-green-500/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <FaCheckCircle className="text-white" /> Purchased
          </span>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-bnb-gold text-black text-xs font-semibold shadow-sm">
          BNBF AI
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col px-5 pt-3 pb-5 gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-wide text-bnb-yellow">
            {fund.plan}
          </h3>
          <p className="text-xl font-bold text-[#FCD535] drop-shadow-[0_0_10px_rgba(252,213,53,0.3)]">
            ${fund.package?.toLocaleString() || 0}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#14171C]/70 rounded-xl border border-[#1E2229] p-1 text-center flex flex-col justify-center">
            <span className="text-[12px] text-gray-400 mb-1">Daily Return</span>
            <span className="text-lg text-[#FCD535]">
              {fund.perday ? `${fund.perday}%` : "N/A"}
            </span>
          </div>

          <div className="bg-[#14171C]/70 rounded-xl border border-[#1E2229] p-1 text-center flex flex-col justify-center">
            <span className="text-[12px] text-gray-400 mb-1">
              {fund.quarter || "?"} Days Total
            </span>
            <span className="text-lg text-[#FCD535]">
              {totalPercentage}%
            </span>

            <span className="text-lg text-[#FCD535] flex flex-col gap-1">
              {isPurchased && status?.totalClaimed !== undefined && (
                <p className="text-xs text-green-400">
                  Claimed: {status.totalClaimed} BUSD
                </p>
              )}
              {nextClaimTime && (
                <p className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                  <FaClock />{" "}
                  {nextClaimTime.toLocaleString("en-US", {
                    hour12: false,
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-3">
          {!isPurchased ? (
            <Button
              className="flex-1 bg-bnb-gold text-bnb-black font-bold hover:bg-amber-600"
              onClick={onBuy}
            >
              Purchase
            </Button>
          ) : (
            <Button
              className={`flex-1 ${
                canClaim
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              onClick={onClaim}
              disabled={!canClaim}
            >
              {canClaim ? "Claim" : "Locked"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

