"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { FaChartLine, FaUsers, FaWallet, FaCoins, FaArrowDown } from "react-icons/fa";
import { THEME } from "@/lib/theme";

interface OverviewData {
  totalUsers: number;
  totalDeposits: number;
  totalWithdraws: number;
  totalProfit: number;
  totalBalance: number;
  dailyStats: { date: string; deposits: number; withdraws: number }[];
  monthlyProfit: { month: string; profit: number }[];
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/overview");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to load overview data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <main
        className="flex items-center justify-center h-screen"
        style={{ background: THEME.bg, color: THEME.text }}
      >
        <p>Loading dashboard...</p>
      </main>
    );

  if (!data)
    return (
      <main
        className="flex items-center justify-center h-screen"
        style={{ background: THEME.bg, color: THEME.text }}
      >
        <p>No data available.</p>
      </main>
    );

  const cards = [
    {
      label: "Total Users",
      value: data.totalUsers.toLocaleString(),
      icon: <FaUsers />,
      color: THEME.accent,
    },
    {
      label: "Total Deposits",
      value: `$${data.totalDeposits.toFixed(2)}`,
      icon: <FaCoins />,
      color: THEME.success,
    },
    {
      label: "Total Withdraws",
      value: `$${data.totalWithdraws.toFixed(2)}`,
      icon: <FaArrowDown />,
      color: THEME.error,
    },
    {
      label: "Total Profit",
      value: `$${data.totalProfit.toFixed(2)}`,
      icon: <FaChartLine />,
      color: THEME.warning,
    },
    {
      label: "Total Balance",
      value: `$${data.totalBalance.toFixed(2)}`,
      icon: <FaWallet />,
      color: THEME.secondary,
    },
  ];

  return (
    <main
      className="min-h-screen p-8 overflow-hidden"
      style={{ background: THEME.bg, color: THEME.text }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        BNBFund Overview Dashboard
      </motion.h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}
          >
            <div>
              <p className="text-sm text-gray-400">{card.label}</p>
              <h3 className="text-xl font-semibold mt-1">{card.value}</h3>
            </div>
            <div
              className="p-3 rounded-xl"
              style={{ background: THEME.bg1, color: card.color }}
            >
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposits vs Withdraws */}
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-6 backdrop-blur-md shadow-lg border"
            style={{
            background: "linear-gradient(145deg, #181A20, #0B0E11)",
            borderColor: THEME.border,
            }}
        >
            <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">
            Daily Deposit / Withdraw Trends
            </h2>
            <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data.dailyStats}>
                <defs>
                <linearGradient id="depositGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.success} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="withdrawGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.error} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={THEME.error} stopOpacity={0} />
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.bg1} />
                <XAxis dataKey="date" stroke={THEME.secondary} />
                <YAxis stroke={THEME.secondary} />
                <Tooltip
                contentStyle={{
                    backgroundColor: THEME.bg2,
                    border: `1px solid ${THEME.border}`,
                    color: THEME.text,
                }}
                />
                <Area
                type="monotone"
                dataKey="deposits"
                stroke={THEME.success}
                fill="url(#depositGradient)"
                strokeWidth={2.5}
                />
                <Area
                type="monotone"
                dataKey="withdraws"
                stroke={THEME.error}
                fill="url(#withdrawGradient)"
                strokeWidth={2.5}
                />
            </AreaChart>
            </ResponsiveContainer>
        </motion.div>

        {/* Monthly Profit */}
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-6 backdrop-blur-md shadow-lg border"
            style={{
            background: "linear-gradient(145deg, #181A20, #0B0E11)",
            borderColor: THEME.border,
            }}
        >
            <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">
            Monthly Profit Evolution
            </h2>
            <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data.monthlyProfit}>
                <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={THEME.accent} stopOpacity={0} />
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.bg1} />
                <XAxis dataKey="month" stroke={THEME.secondary} />
                <YAxis stroke={THEME.secondary} />
                <Tooltip
                contentStyle={{
                    backgroundColor: THEME.bg2,
                    border: `1px solid ${THEME.border}`,
                    color: THEME.text,
                }}
                />
                <Area
                type="monotone"
                dataKey="profit"
                stroke={THEME.accent}
                fill="url(#profitGradient)"
                strokeWidth={2.5}
                activeDot={{ r: 6, fill: THEME.accent }}
                />
            </AreaChart>
            </ResponsiveContainer>
        </motion.div>
      </div>
    </main>
  );
}
