"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { FaHistory } from "react-icons/fa";
import { THEME } from "@/lib/theme";

export default function HistoryPage() {
  type Transaction = {
    id: number;
    type: string;
    tokenSymbol?: string | null;
    amountWei: string;
    status: string;
    txHash?: string | null;
    createdAt: string;
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [search, setSearch] = useState("");

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions", { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setTransactions(j.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = transactions.filter((t) => {
    if (filter !== "All" && t.type !== filter) return false;
    if (search && !(t.txHash ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = filtered.sort((a, b) =>
    sortBy === "latest" ? +new Date(b.createdAt) - +new Date(a.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt)
  );

  function formatToken(amountWei: string, decimals = 18) {
    try {
      return parseFloat((Number(amountWei) / 10 ** decimals).toFixed(6));
    } catch {
      return 0;
    }
  }


  return (
    <div className="min-h-screen">
    <div className="max-w-3xl  mx-auto p-5 mt-20 rounded-2xl" style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}` }}>
      <div className="flex items-center justify-between border-b border-[#2B3139] pb-4 mb-4">
        <div className="flex flex-row gap-3 items-center">
        <div className="text-bnb-gold text-2xl"><FaHistory /> </div>
        <h2 className="text-2xl font-semibold" style={{ color: THEME.accent }}>Transaction History</h2>
        </div>
        <p className="text-gray-400 text-sm">All transactions for your account</p>
      </div>

      <div className="flex gap-3 items-center mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-[#0B0E11] border border-[#2B3139] rounded-md px-3 py-2 text-sm">
          <option>All</option>
          <option>Deposit</option>
          <option>Withdraw</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#0B0E11] border border-[#2B3139] rounded-md px-3 py-2 text-sm">
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>

        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tx hash..." className="bg-[#0B0E11] border border-[#2B3139] rounded-md px-3 py-2 text-sm flex-1" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111418] rounded-xl border border-[#2B3139] p-4">
        {loading ? <div className="text-center text-gray-400 py-8">Loading...</div> : sorted.length === 0 ? <div className="text-center text-gray-400 py-8">No transactions found.</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-[#2B3139]">
                  <th className="p-2">#</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Token</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Tx Hash</th>
                  <th className="p-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t, i) => (
                  <tr key={t.id} className="border-t border-[#2B3139] hover:bg-[#1E2329]">
                    <td className="p-2">{i + 1}</td>
                    <td className={`p-2 font-medium ${t.type === "Deposit" ? "text-yellow-400" : "text-red-400"}`}>{t.type}</td>
                    <td className="p-2">{t.tokenSymbol ?? "ETH"}</td>
                    <td className="p-2 font-mono">{formatToken(t.amountWei, t.tokenSymbol === "USDT" ? 6 : 18)}</td>
                    <td className="p-2 text-green-400">{t.status}</td>
                    <td className="p-2 font-mono">
                      <a
                        className="text-yellow-400 hover:underline"
                        href={`${
                            process.env.NETWORK === "bsc"
                            ? `https://bscscan.com/tx/${t.txHash}`
                            : `https://sepolia.etherscan.io/tx/${t.txHash}`
                        }`}
                        target="_blank"
                        rel="noreferrer"
                        >
                        {t.txHash ? `${t.txHash.slice(0, 5)}...${t.txHash.slice(-5)}` : "-"}
                      </a>
                    </td>
                    <td className="p-2">{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
    </div>
  );
}
