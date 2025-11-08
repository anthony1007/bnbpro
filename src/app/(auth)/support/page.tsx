// src/app/(auth)/support/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { THEME } from "@/lib/theme";
import { FaPaperPlane, FaUserCircle, FaInbox, FaReply } from "react-icons/fa";

/**
 * Support page (auth)
 * - Hiển thị ticket của user (hoặc tất cả nếu user là ADMIN)
 * - Tạo ticket mới
 * - Nếu user là admin, hiển thị reply form cho từng ticket
 *
 * Giao diện: dark luxury, responsive
 */

type Reply = {
  id: number;
  ticketId: number;
  adminId?: number | null;
  userId?: number | null;
  message: string;
  createdAt: string;
};

type Ticket = {
  id: number;
  userId: number;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; email?: string | null; name?: string | null } | null;
  replies?: Reply[] | null;
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyMap, setReplyMap] = useState<Record<number, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  async function loadTickets() {
    setLoading(true);
    try {
      const meRes = await fetch("/api/user/me", { credentials: "include" });
      const meJson = await meRes.json().catch(() => ({}));
      setIsAdmin(Boolean(meJson?.user?.role === "ADMIN"));

      const res = await fetch("/api/support", { credentials: "include" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Failed load tickets", j);
        setTickets([]);
      } else {
        setTickets(j.tickets ?? []);
      }
    } catch (err) {
      console.error("loadTickets err", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function createTicket(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!subject.trim() || !message.trim()) return alert("Subject and message are required");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", subject: subject.trim(), message: message.trim() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j.error || "Create ticket failed");
      } else {
        setSubject("");
        setMessage("");
        await loadTickets();
      }
    } catch (err: any) {
      console.error("createTicket err", err);
      alert(err?.message || "Create ticket failed");
    }
  }

  async function sendReply(ticketId: number) {
    const txt = (replyMap[ticketId] || "").trim();
    if (!txt) return;
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", ticketId, message: txt }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(j.error || "Reply failed");
      } else {
        setReplyMap((s) => ({ ...s, [ticketId]: "" }));
        await loadTickets();
      }
    } catch (err: any) {
      console.error("sendReply err", err);
      alert("Reply failed");
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: THEME.accent }}>
              Support Center
            </h1>
            <p className="text-sm text-[#A0A6B1] mt-1">Open a ticket and our support team will get back to you.</p>
          </div>
          {/* <div className="flex items-center gap-3">
            <div className="text-sm text-[#A0A6B1]">Role:</div>
            <div className="px-3 py-1 rounded-md text-sm" style={{ background: THEME.bg2, color: THEME.text }}>
              {isAdmin ? "Admin" : "User"}
            </div>
          </div> */}
        </div>

        {/* Create Ticket Box */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-2xl p-6" style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}>
          <form onSubmit={createTicket} className="space-y-4">
            <div className="flex items-center gap-3">
              <FaInbox className="text-yellow-400 text-xl" />
              <h2 className="text-lg font-semibold" style={{ color: THEME.text }}>Create New Ticket</h2>
            </div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-md px-3 py-2 text-sm text-white"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or request..."
              className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-md px-3 py-3 text-sm min-h-[120px] resize-none text-white"
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setSubject(""); setMessage(""); }} className="px-4 py-2 rounded-md text-sm" style={{ border: `1px solid ${THEME.border}`, color: THEME.text }}>
                Reset
              </button>
              <button type="submit" className="px-4 py-2 rounded-md text-sm bg-yellow-400 text-black">
                <FaPaperPlane className="inline mr-2" /> Submit Ticket
              </button>
            </div>
          </form>
        </motion.div>

        {/* Tickets List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No tickets found.</div>
          ) : (
            tickets.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4" style={{ background: THEME.bg2, border: `1px solid ${THEME.border}` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FaUserCircle className="text-2xl text-[#A0A6B1]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg" style={{ color: THEME.text }}>{t.subject}</h3>
                        <span className="text-xs px-2 py-1 rounded-md" style={{ background: THEME.bg1, color: THEME.secondary }}>{t.status}</span>
                      </div>
                      <div className="text-sm text-[#A0A6B1] mt-1">{t.message}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {t.user?.name ? `${t.user.name}` : t.user?.email ?? "You"} • {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs text-gray-400">
                    <div>Updated: {new Date(t.updatedAt).toLocaleString()}</div>
                  </div>
                </div>

                {/* Replies */}
                <div className="mt-4 space-y-3">
                  {t.replies && t.replies.length > 0 ? (
                    t.replies.map((r) => (
                      <div key={r.id} className="p-3 rounded-md" style={{ background: THEME.bg1, border: `1px solid ${THEME.border}` }}>
                        <div className="text-sm text-gray-400">
                          <span className="font-semibold" style={{ color: r.adminId ? THEME.accent : THEME.success }}>
                            {r.adminId ? "Admin" : "You"}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-200">{r.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm italic text-gray-500">No replies yet.</div>
                  )}
                </div>

                {/* Admin reply box */}
                {isAdmin && (
                  <div className="mt-4">
                    <div className="flex gap-2">
                      <input
                        value={replyMap[t.id] ?? ""}
                        onChange={(e) => setReplyMap((s) => ({ ...s, [t.id]: e.target.value }))}
                        placeholder="Write a reply..."
                        className="flex-1 bg-[#0B0E11] border border-[#2B3139] rounded-md px-3 py-2 text-sm"
                      />
                      <button onClick={() => sendReply(t.id)} className="px-4 py-2 rounded-md bg-[#FCD535] text-black flex items-center gap-2">
                        <FaReply /> Reply
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
