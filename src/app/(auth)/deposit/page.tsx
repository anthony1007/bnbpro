"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";
import { FaCopy, FaQrcode } from "react-icons/fa";
import { MdOutlineInfo } from "react-icons/md";
import { PiHandDepositFill } from "react-icons/pi";
import { THEME } from "@/lib/theme";
import { useToast } from "@/context/ToastContext";

type Deposit = {
  id: number;
  txHash: string;
  amountWei: string;
  tokenSymbol?: string | null;
  tokenAddress?: string | null;
  createdAt: string;
};

export default function DepositPage() {
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [balanceWei, setBalanceWei] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const POLL_MS = 8000;
  const [lastHash, setLastHash] = useState<string>("");

  // 🧩 Tải dữ liệu
  async function loadData(showLoader = false) {
    if (showLoader) setLoading(true);
    try {
      const [addrRes, balRes] = await Promise.all([
        fetch("/api/user/deposit-address", { credentials: "include" }),
        fetch("/api/user/me", { credentials: "include" }),
      ]);

      const addrJson = await addrRes.json();
      const balJson = await balRes.json();

      const newAddr = addrJson.depositAddress ?? null;
      const newBal = balJson?.user?.balanceWei ?? balJson?.balanceWei ?? "0";

      const hash = JSON.stringify([newAddr, newBal]);
      if (hash !== lastHash) {
        setDepositAddress(newAddr);
        setBalanceWei(newBal);
        setLastHash(hash);
      }
    } catch (e) {
      console.error("loadData error", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(true);
    const iv = setInterval(() => loadData(false), POLL_MS);
    return () => clearInterval(iv);
  }, [lastHash]);

  // 🪙 Tạo địa chỉ nạp
  async function ensureDepositAddress() {
    try {
      setCreating(true);
      const res = await fetch("/api/user/deposit-address", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      if (res.ok && j.depositAddress) {
        setDepositAddress(j.depositAddress);
        alert("Deposit address created successfully!");
      } else {
        alert("Error: " + (j?.error || "Failed to create address"));
      }
    } catch (e: any) {
      console.error("ensureDepositAddress error:", e);
      alert("Error: " + (e.message || e));
    } finally {
      setCreating(false);
    }
  }

  // 📋 Sao chép địa chỉ
  function copy(v?: string | null) {
    if (!v) return;
    navigator.clipboard
      .writeText(v)
      .then(() => showToast("Deposit address copied", "success"))
      .catch(() => {});
  }

  // 💰 Format ETH
  const formatEth = (wei: string) => {
    try {
      const eth = parseFloat(ethers.formatEther(wei));
      return Number(eth.toFixed(6)).toString();
    } catch {
      return "5";
    }
  };

  // 🧱 Giao diện
  return (
    <div className="pt-20 m-5 min-h-screen">
      <div
        className="max-w-3xl mx-auto p-5 rounded-2xl shadow-lg border"
        style={{
          background: THEME.card,
          color: THEME.text,
          borderColor: THEME.border,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2B3139] mb-4 pb-4">
          <div>
            <div className="flex items-center gap-3 py-3">
              <PiHandDepositFill className="text-2xl text-yellow-400" />
              <h2
                className="text-2xl font-semibold"
                style={{ color: THEME.accent }}
              >
                Deposit
              </h2>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Current Balance</div>
            <div className="font-mono text-lg">${formatEth(balanceWei)}</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-[#2B3139] bg-[#111418] mb-6"
        >
          {loading ? (
            <div className="text-gray-400 text-center py-8">
              Loading deposit data...
            </div>
          ) : (
            <>
              {depositAddress ? (
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-row items-center gap-4">
                      <FaQrcode className="text-yellow-400 text-xl" />
                      <span className="text-sm text-gray-400">
                        Deposit Address
                      </span>
                    </div>
                    <div className="flex flex-row">
                      <div className="items-center justify-center">
                        <div className="font-mono text-sm break-all bg-[#0C0F12] text-gray-200 border border-[#2B3139] rounded-md p-3 my-3">
                          {depositAddress}
                        </div>
                        <button
                          onClick={() => copy(depositAddress)}
                          className="text-sm text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-2"
                        >
                          <FaCopy />
                          <span> Copy</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="bg-[#0B0E11] p-4 rounded-lg border border-[#2B3139]">
                      <QRCodeCanvas value={depositAddress} size={160} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 mb-3">
                    You don’t have a deposit address yet.
                  </p>
                  <button
                    onClick={ensureDepositAddress}
                    disabled={creating}
                    className="px-4 py-2 rounded bg-yellow-400 text-black font-medium disabled:opacity-60"
                  >
                    {creating ? "Creating..." : "Generate Address"}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Important Notes */}
        <div className="bg-[#111418] p-5 rounded-xl border border-[#2B3139] mt-6 space-y-3">
          <div className="flex items-start gap-3">
            <MdOutlineInfo className="text-yellow-400 text-xl mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">Important:</p>
              <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1 mt-1">
                <li>Chỉ gửi ETH hoặc token tương thích qua đúng mạng lưới.</li>
                <li>
                  Không gửi token từ smart contract trực tiếp — có thể mất tài sản.
                </li>
                <li>Giao dịch cần ít nhất 1-2 xác nhận trên blockchain.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
