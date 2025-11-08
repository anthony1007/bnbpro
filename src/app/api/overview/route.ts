import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfMonth, format } from "date-fns";

export async function GET() {
  try {
    // Tổng users
    const totalUsers = await prisma.user.count();

    // Tổng balance (wei → BNB/USD tuỳ cấu hình)
    const balances = await prisma.user.aggregate({
      _sum: { balanceWei: true },
    });

    // Tổng deposits
    const totalDeposits = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "Deposit", status: "SUCCESS" },
    });

    // Tổng withdraws
    const totalWithdraws = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "Withdraw", status: "SUCCESS" },
    });

    // Tổng profit
    const totalProfit = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "Profit", status: "SUCCESS" },
    });

    // Biểu đồ daily deposits/withdraws (7 ngày gần nhất)
    const today = new Date();
    const last7 = subDays(today, 6);
    const dailyData = await prisma.transaction.groupBy({
      by: ["type", "createdAt"],
      where: {
        createdAt: { gte: last7 },
        status: "SUCCESS",
        type: { in: ["Deposit", "Withdraw"] },
      },
      _sum: { amount: true },
    });

    const dailyStats: Record<string, { deposits: number; withdraws: number }> =
      {};

    dailyData.forEach((t) => {
      const day = format(t.createdAt, "yyyy-MM-dd");
      if (!dailyStats[day]) dailyStats[day] = { deposits: 0, withdraws: 0 };
      if (t.type === "Deposit") dailyStats[day].deposits +=
        Number(t._sum.amount || 0);
      else if (t.type === "Withdraw")
        dailyStats[day].withdraws += Number(t._sum.amount || 0);
    });

    const dailyChart = Object.keys(dailyStats)
      .sort()
      .map((d) => ({ date: d, ...dailyStats[d] }));

    // Biểu đồ monthly profit (12 tháng)
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const profits = await prisma.profitHistory.findMany({
      where: { createdAt: { gte: startOfYear } },
    });

    const monthly: Record<string, number> = {};
    profits.forEach((p) => {
      const m = format(p.createdAt, "MMM");
      monthly[m] = (monthly[m] || 0) + p.amount;
    });

    const monthlyProfit = Object.keys(monthly).map((m) => ({
      month: m,
      profit: monthly[m],
    }));

    return NextResponse.json({
      totalUsers,
      totalDeposits: Number(totalDeposits._sum.amount || 0),
      totalWithdraws: Number(totalWithdraws._sum.amount || 0),
      totalProfit: Number(totalProfit._sum.amount || 0),
      totalBalance: Number((balances._sum.balanceWei)?.toFixed(3) || 0),
      dailyStats: dailyChart,
      monthlyProfit,
    });
  } catch (e) {
    console.error("Overview API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
