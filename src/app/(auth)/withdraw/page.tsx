"use client";
import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";
import { PiHandWithdrawFill } from "react-icons/pi";
import { THEME } from "@/lib/theme";

export default function WithdrawWidget() {
  const { showToast } = useToast();
  const [balanceWei, setBalanceWei] = useState("0");
  const [tokenSymbol, setTokenSymbol] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [pending, setPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatEth = (wei: string) => {
    try {
      const eth = parseFloat(ethers.formatEther(wei));
      return Number(eth.toFixed(6)).toString();
    } catch {
      return "0.000000";
    }
  };

  async function loadBalance() {
    try {
      const res = await fetch("/api/user/me", { credentials: "include" });
      if (!res.ok) throw new Error("Cannot fetch balance");

      const data = await res.json();
      const bal = data?.user?.balanceWei ?? data?.balanceWei ?? "0";
      setBalanceWei(bal);
      setHasError(false);
    } catch (err) {
      console.error("Balance fetch error:", err);
      if (!hasError) {
        showToast("Failed to load balance", "error");
        setHasError(true);
      }
    }
  }

  useEffect(() => {
    loadBalance();

    intervalRef.current = setInterval(() => {
      loadBalance();
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Withdraw handler
  async function handleWithdraw() {
    if (!amount || !recipient) {
      showToast("Please fill in all fields", "warning");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, tokenSymbol, recipient }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Withdraw failed");

      showToast("Withdraw request submitted!", "success");
      setAmount("");
      setRecipient("");
      await loadBalance();
    } catch (e: any) {
      showToast(e.message || "Error", "error");
    } finally {
      setPending(false);
    }
  }

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
        <div className="flex items-center justify-between border-b border-[#2B3139] mb-4 pb-4">
          <div>
            <div className="flex items-center gap-3 py-3">
              <PiHandWithdrawFill className="text-2xl text-yellow-400" />
              <h2
                className="text-2xl font-semibold"
                style={{ color: THEME.accent }}
              >
                Withdraw
              </h2>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Current Balance</div>
            <div className="font-mono text-lg">${formatEth(balanceWei)}</div>
          </div>
        </div>

        {/* Withdraw Form */}
        <div className="bg-[#111418] p-5 rounded-xl border border-[#2f3136] flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400">Token</label>
            <select
              className="w-full mt-1 p-2 bg-[#0c0f12] rounded-md border border-[#2f3136] text-sm"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
            >
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 p-2 bg-[#0c0f12] rounded-md border border-[#2f3136] text-sm"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400">Recipient</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full mt-1 p-2 bg-[#0c0f12] rounded-md border border-[#2f3136] text-sm font-mono"
              placeholder="0xRecipientWallet"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={pending}
            onClick={handleWithdraw}
            className="mt-3 px-4 py-3 rounded-lg font-semibold w-full text-lg transition-all duration-200"
            style={{
              background: pending
                ? "#555"
                : "linear-gradient(90deg, #E0B90B, #FCD535)",
              color: "#000",
              boxShadow: "0 0 12px rgba(240,205,35,0.25)",
            }}
          >
            {pending ? "Processing..." : "Withdraw"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
