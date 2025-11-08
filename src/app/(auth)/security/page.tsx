"use client";

import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";
import { RiLockPasswordLine } from "react-icons/ri";
import { THEME } from "@/lib/theme";

export default function ChangePassword() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSubmit() {
    if (form.newPassword !== form.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      showToast("Password changed successfully!", "success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showToast(err.message || "Error occurred", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-5 m-5 min-h-screen">
      <div
        className="max-w-md mx-auto mt-12 p-5 rounded-2xl shadow-lg border"
        style={{
          background: `linear-gradient(180deg, ${THEME.bg1}, ${THEME.bg2})`,
          color: THEME.text,
          borderColor: THEME.border,
        }}
      >
        <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-3">
          <RiLockPasswordLine className="text-3xl text-yellow-400" />
          <h2 className="text-xl font-semibold" style={{ color: THEME.accent }}>
            Change Password
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <InputField
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={(v) => handleChange("currentPassword", v)}
          />
          <InputField
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={(v) => handleChange("newPassword", v)}
          />
          <InputField
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => handleChange("confirmPassword", v)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          onClick={handleSubmit}
          className="mt-6 w-full py-3 font-semibold rounded-lg text-lg transition-all duration-200"
          style={{
            background: loading
              ? "#555"
              : "linear-gradient(90deg, #E0B90B, #FCD535)",
            color: "#000",
            boxShadow: "0 0 12px rgba(240, 205, 35, 0.3)",
          }}
        >
          {loading ? "Updating..." : "Change Password"}
        </motion.button>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm bg-[#111418] border border-[#2f3136] focus:border-yellow-500 focus:ring-1 focus:ring-yellow-400 outline-none transition-all duration-200"
      />
    </div>
  );
}
