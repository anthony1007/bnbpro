"use client";

import { useEffect, useState } from "react";
import FundForm from "@/components/backend/FundForm";
import { THEME } from "@/lib/theme";
import { motion } from "framer-motion";
import { FaChartLine, FaCheckCircle, FaClock } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface Fund {
  id: string;
  plan: string;
  package: number;
  perday?: number;
  quarter?: number;
  image?: { url: string };
}

export default function AdminFundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Fund | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchFunds = async () => {
    setLoading(true);
    const res = await fetch("/api/funds/list", { credentials: "include" });
    const data = await res.json();
    if (data.ok) setFunds(data.funds);
    setLoading(false);
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fund?")) return;
    const res = await fetch("/api/funds/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.ok) fetchFunds();
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: THEME.bg, color: THEME.text }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-bnb-gold">Funds Management</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-bnb-yellow text-black rounded-lg hover:opacity-80"
        >
          + Add Fund
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        //   {funds.map((fund) => (
        //     <div
        //       key={fund.id}
        //       className="relative group w-[310px] max-sm:w-full
        // bg-linear-to-b from-[#111418] via-[#0E1013] to-[#080A0D]
        // border border-[#1E2229] hover:border-[#FCD535]/50
        // rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(252,213,53,0.05)]
        // flex flex-col justify-between text-gray-200"
        //       style={{ background: THEME.card, borderColor: THEME.border }}
        //     >
        //       <img
        //         src={fund.image?.url || "/placeholder.png"}
        //         alt="fund"
        //         className="w-full h-[260px] object-cover transition-transform duration-700 group-hover:scale-110"
        //       />
        //       <div className="font-bold text-lg">{fund.plan}</div>
        //       <div className="text-gray-400 mb-2">Package: ${fund.package}</div>
        //       <div className="text-sm text-gray-500 mb-4">
        //         {fund.perday ? `${fund.perday}% / day` : ""} {fund.quarter ? `| ${fund.quarter} days` : ""}
        //       </div>
        //       <div className="flex gap-3">
        //         <button
        //           onClick={() => { setEditing(fund); setShowForm(true); }}
        //           className="flex-1 py-2 rounded-lg bg-bnb-yellow text-black font-semibold"
        //         >
        //           Edit
        //         </button>
        //         <button
        //           onClick={() => handleDelete(fund.id)}
        //           className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold"
        //         >
        //           Delete
        //         </button>
        //       </div>
        //     </div>
        //   ))}
        // </div>
        <div className="flex flex-row max-sm:flex-col justify-center gap-5">
          {funds.map((fund) => (
            <div
              key={fund.id}
              className="relative group w-[310px] max-sm:w-full 
                bg-linear-to-b from-[#111418] via-[#0E1013] to-[#080A0D]
                border border-[#1E2229] hover:border-[#FCD535]/50
                rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(252,213,53,0.05)]
                flex flex-col justify-between text-gray-200"
              style={{ background: THEME.card, borderColor: THEME.border }}
            >
              <img
                src={fund.image?.url || "/placeholder.png"}
                alt="fund"
                className="w-full h-[260px] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="text-xl font-bold tracking-wide text-bnb-yellow">
                  {fund.plan}
                </h3>
                <p className="text-xl font-bold text-[#FCD535] drop-shadow-[0_0_10px_rgba(252,213,53,0.3)]">
                  ${fund.package?.toLocaleString() || 0}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 px-5">
                <div className="bg-[#14171C]/70 rounded-xl border border-[#1E2229] p-1 text-center flex flex-col justify-center">
                  <span className="text-[12px] text-gray-400 mb-1">Daily Return</span>
                  <span className="text-lg text-[#FCD535]">
                    {fund.perday ? `${fund.perday}%` : "N/A"}
                  </span>
                </div>
                <div className="bg-[#14171C]/70 rounded-xl border border-[#1E2229] p-1 text-center flex flex-col justify-center">
                  <span className="text-[12px] text-gray-400 mb-1">Days Total</span>
                  <span className="text-lg text-[#FCD535]">
                    {fund.quarter ? `${fund.quarter} days` : ""} 
                  </span>
                </div>
              </div>
              <div className="flex gap-3 p-5">
                <button
                  onClick={() => {
                    setEditing(fund);
                    setShowForm(true);
                  }}
                  className="flex-1 py-2 rounded-lg bg-bnb-yellow text-black font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(fund.id)}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          )).reverse()}
        </div>
      )}

      {showForm && (
        <FundForm
          editing={editing}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchFunds();
          }}
        />
      )}
    </div>
  );
}
