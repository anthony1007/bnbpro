// // src/hooks/useFundStatus.ts
// "use client";
// import { useCallback, useEffect, useState, useRef } from "react";
// import type { FundStatus } from "@/types";

// export function useFundStatus(pollMs = 15000) {
//   const [statuses, setStatuses] = useState<FundStatus[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [serverTime, setServerTime] = useState<number | null>(null);
//   const ivRef = useRef<number | null>(null);

//   const fetchStatus = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/funds/status", { credentials: "include" });
//       if (!res.ok) {
//         const txt = await res.text().catch(() => "");
//         console.error("❌ Fund status API failed:", res.status, txt);
//         setStatuses([]);
//         return; 
//       }
//       const data = await res.json().catch(() => null);
//       if (!data || !Array.isArray(data.statuses)) {
//         console.warn("⚠️ API trả về không hợp lệ:", data);
//         setStatuses([]);
//         return;
//       }
//       setStatuses(data.statuses);
//     } catch (err) {
//       console.error("Failed to fetch fund status", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStatus();
//     // poll
//     const id = setInterval(fetchStatus, pollMs);
//     ivRef.current = id as unknown as number;
//     return () => {
//       if (ivRef.current) clearInterval(ivRef.current);
//     };
//   }, [fetchStatus, pollMs]);

//   const refresh = useCallback(async () => {
//     await fetchStatus();
//   }, [fetchStatus]);

//   return { statuses, loading, serverTime, refresh: fetchStatus };
// }

// export default useFundStatus;


// src/hooks/useFundStatus.ts
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

