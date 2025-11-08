"use client";
import React, { useEffect, useState } from "react";
import FundCard from "@/components/FundCard";
import { useToast } from "@/context/ToastContext";
import useFundStatus from "@/hooks/useFundStatus";
import type { Fund } from "@prisma/client";

export default function FundPage() {
  const { showToast } = useToast();
  const { statuses, loading: statusLoading, refresh } = useFundStatus();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch("/api/funds/list");
        let j: any = {};
        try { j = await res.json(); } catch {}
        if (res.ok) setFunds(j.funds ?? []);
        else showToast("Failed to load funds", "error");
      } catch {
        showToast("Failed to load funds", "error");
      }
    }

    async function loadPurchased() {
      try {
        const res = await fetch("/api/funds/purchased", { credentials: "include" });
        let j: any = {};
        try { j = await res.json(); } catch {}
        if (res.ok) {
          const ids = (j.purchasedFundIds ?? []).map(String);
          setPurchasedIds(ids);
        } else {
          setPurchasedIds([]);
        }
      } catch (err) {
        console.error("Failed to fetch purchased", err);
      }
    }

    loadFunds();
    loadPurchased();
    refresh();
  }, [showToast, refresh]);

  async function handleBuy(fundId: string) {
    try {
      const res = await fetch("/api/funds/purchase", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fundId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Purchase failed");
      showToast("Purchased!", "success");
      setPurchasedIds((s) => [...s, fundId]);
      refresh();
    } catch (err: any) {
      showToast(err.message || "Buy failed", "error");
    }
  }

  async function handleClaim(purchaseId: number | string) {
    try {
      const res = await fetch("/api/funds/claim", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Claim failed");
      showToast(`Claimed ${j.amount}`, "success");
      refresh();
    } catch (err: any) {
      showToast(err.message || "Claim failed", "error");
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Funds</h1>
    <div className="flex flex-wrap justify-center gap-6">
        {funds.map((f) => {
          const status = statuses.find((s) => s.fundId === f.id) ?? null;
          const purchased = purchasedIds.includes(f.id) || !!status?.isPurchased;
          return (
            <FundCard
              key={f.id}
              fund={f}
              status={status ?? undefined}
              onBuy={() => handleBuy(f.id)}
              onClaim={() => {
                if (status && status.isPurchased) return handleClaim(status.fundId);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
