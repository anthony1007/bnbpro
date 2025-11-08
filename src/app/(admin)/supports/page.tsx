"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { THEME } from "@/lib/theme";
import {
  FaUserShield,
  FaReply,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaAngleDown,
} from "react-icons/fa";

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

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [replyMap, setReplyMap] = useState<Record<number, string>>({});
  const [editingReply, setEditingReply] = useState<Record<number, string>>({});
  const [editMode, setEditMode] = useState<Record<number, boolean>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  async function loadTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support", { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to load tickets");
      setTickets(j.tickets ?? []);
      setIsAdmin(j.role === "ADMIN"); // sửa lỗi quyền không được bật
    } catch (err) {
      console.error("loadTickets error:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function sendReply(ticketId: number) {
    const txt = (replyMap[ticketId] || "").trim();
    if (!txt) return alert("Please enter a reply message");
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", ticketId, message: txt }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Reply failed");
      setReplyMap((s) => ({ ...s, [ticketId]: "" }));
      await loadTickets();
    } catch (err: any) {
      alert(err.message || "Reply failed");
    }
  }

  async function updateStatus(ticketId: number, status: string) {
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", ticketId, status }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Status update failed");
      await loadTickets();
    } catch (err: any) {
      alert(err.message || "Status update failed");
    }
  }

  async function editReply(replyId: number) {
    const msg = editingReply[replyId]?.trim();
    if (!msg) return alert("Message cannot be empty");
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "editReply", replyId, message: msg }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Edit failed");
      await loadTickets();
      setEditMode((s) => ({ ...s, [replyId]: false }));
    } catch (err: any) {
      alert(err.message || "Edit failed");
    }
  }

  async function deleteReply(replyId: number) {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteReply", replyId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Delete failed");
      await loadTickets();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  }

  const toggleExpand = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const statusColors: Record<string, string> = {
    OPEN: "bg-yellow-400 text-black",
    IN_PROGRESS: "bg-blue-400/20 text-blue-300",
    CLOSED: "bg-green-500/20 text-green-400",
  };

  const statuses = ["OPEN", "IN_PROGRESS", "CLOSED"];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: THEME.accent }}>
              Admin Support Dashboard
            </h1>
            <p className="text-sm text-[#A0A6B1] mt-1">
              Manage user tickets, review messages, and reply to open requests.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaUserShield className="text-yellow-400 text-lg" />
            <span style={{ color: THEME.text }}>
              {isAdmin ? "Administrator" : "User"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No tickets available.</div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden shadow-lg"
                style={{
                  background: THEME.card,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                {/* HEADER */}
                <div
                  onClick={() => toggleExpand(t.id)}
                  className="cursor-pointer flex justify-between items-center px-6 py-4 hover:bg-[#0B0E11]"
                >
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: THEME.text }}>
                      {t.subject}
                    </h3>
                    <div className="text-sm text-[#A0A6B1] mt-1">
                      {t.user?.name || t.user?.email || "Unknown User"} —{" "}
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      disabled={!isAdmin}
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                      className={`text-xs px-3 py-1 rounded-md appearance-none pr-6 ${
                        statusColors[t.status] || "bg-gray-600 text-white"
                      } ${!isAdmin ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{
                        border: `1px solid ${THEME.border}`,
                      }}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <FaAngleDown
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={10}
                    />
                  </div>
                </div>

                {/* BODY */}
                {expanded[t.id] && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 pb-6 pt-2 space-y-3"
                  >
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: THEME.bg2,
                        border: `1px solid ${THEME.border}`,
                      }}
                    >
                      <p className="text-sm text-gray-300">{t.message}</p>
                    </div>

                    {/* Replies */}
                    {t.replies && t.replies.length > 0 && (
                      <div className="space-y-2">
                        {t.replies.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-xl p-3 relative"
                            style={{
                              background: r.adminId ? "#1D1F23" : "#101215",
                              border: `1px solid ${THEME.border}`,
                            }}
                          >
                            <div className="flex justify-between">
                              <div className="text-xs text-gray-500 mb-1">
                                <span
                                  className={`font-semibold ${
                                    r.adminId ? "text-[#FCD535]" : "text-green-400"
                                  }`}
                                >
                                  {r.adminId ? "Admin" : "User"}
                                </span>{" "}
                                • {new Date(r.createdAt).toLocaleString()}
                              </div>

                              {isAdmin && r.adminId && (
                                <div className="flex gap-2 text-gray-400 text-sm">
                                  {!editMode[r.id] ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          setEditMode((s) => ({
                                            ...s,
                                            [r.id]: true,
                                          }))
                                        }
                                        className="hover:text-yellow-400"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        onClick={() => deleteReply(r.id)}
                                        className="hover:text-red-500"
                                      >
                                        <FaTrash />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => editReply(r.id)}
                                        className="hover:text-green-400"
                                      >
                                        <FaCheck />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEditMode((s) => ({
                                            ...s,
                                            [r.id]: false,
                                          }))
                                        }
                                        className="hover:text-gray-400"
                                      >
                                        <FaTimes />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {!editMode[r.id] ? (
                              <p className="text-sm text-gray-200">{r.message}</p>
                            ) : (
                              <input
                                value={editingReply[r.id] ?? r.message}
                                onChange={(e) =>
                                  setEditingReply((s) => ({
                                    ...s,
                                    [r.id]: e.target.value,
                                  }))
                                }
                                className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-md px-2 py-1 text-sm text-gray-100 mt-2"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply box */}
                    <div className="flex gap-2 mt-4">
                      <input
                        value={replyMap[t.id] ?? ""}
                        onChange={(e) =>
                          setReplyMap((prev) => ({ ...prev, [t.id]: e.target.value }))
                        }
                        placeholder="Write your admin reply..."
                        className="flex-1 bg-[#0B0E11] border border-[#2B3139] rounded-md px-3 py-2 text-sm text-gray-100"
                      />
                      <button
                        onClick={() => sendReply(t.id)}
                        disabled={!isAdmin}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                          isAdmin
                            ? "bg-[#FCD535] text-black"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FaReply /> Reply
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
