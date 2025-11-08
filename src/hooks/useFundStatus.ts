"use client";
import { useState, useCallback } from "react";

export default function useFundStatus() {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/funds/status", { credentials: "include" });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        console.error("❌ Fund status API failed:", res.status, data?.error);
        throw new Error(`Failed to fetch fund status (${res.status})`);
      }

      setStatuses(data.statuses ?? []);
    } catch (err) {
      console.error("⚠️ Invalid or expired token", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { statuses, loading, refresh: fetchStatus };
}

