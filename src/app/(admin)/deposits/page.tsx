"use client";
import React, { useEffect, useState } from "react";

type Deposit = {
  id: number;
  txHash: string;
  amountWei: string;
  confirmations: number;
  userId: number | null;
  createdAt: string;
};

type User = { id: number; email: string; address?: string | null };

export default function Deposit() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [dRes, uRes] = await Promise.all([
        fetch("/api/admin/deposit"), 
        fetch("/api/admin/user")
      ]);
      const djson = await dRes.json();
      const ujson = await uRes.json();
      setDeposits(djson || []);
      setUsers(ujson || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function assign(depositId: number, userId: number) {
    try {
      const res = await fetch("/api/admin/assign-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId, userId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Assign failed");
      await load();
      alert("Assigned");
    } catch (err: any) {
      alert("Error: " + (err.message || err));
    }
  }

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Deposits</h2>
      <table className="min-w-full border">
        <thead><tr><th>id</th><th>txHash</th><th>amount(wei)</th><th>conf</th><th>userId</th><th>assign</th></tr></thead>
        <tbody>
          {deposits.map((d) => (
            <tr key={d.id} className="border-t">
              <td>{d.id}</td>
              <td className="font-mono">{d.txHash}</td>
              <td>{d.amountWei}</td>
              <td>{d.confirmations}</td>
              <td>{d.userId ?? "NULL"}</td>
              <td>
                <select id={`user-${d.id}`} defaultValue="">
                  <option value="">Select user</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.email} ({u.address})</option>)}
                </select>
                <button onClick={() => {
                  const sel = document.getElementById(`user-${d.id}`) as HTMLSelectElement;
                  if (!sel || !sel.value) return alert("Pick user");
                  assign(d.id, Number(sel.value));
                }} className="ml-2 px-2 py-1 border rounded">Assign</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
