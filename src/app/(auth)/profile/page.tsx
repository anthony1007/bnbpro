"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { THEME } from "@/lib/theme";

export default function ProfileInfo() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    sponsor: "",
    address: "",
    phone: "",
  });

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/user/me");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load profile");
      setUser({
        name: data.name || "",
        email: data.email || "",
        sponsor: data.sponsor || "",
        address: data.address || "",
        phone: data.phone || "",
      });
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          address: user.address,
          phone: user.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      showToast("Profile updated successfully!", "success");
      setUser(data.user);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen m-5">
      <div
        className="max-w-3xl mx-auto mt-20 p-5 rounded-2xl shadow-lg border border-[#2b2f36]"
        style={{
          background: `linear-gradient(180deg, ${THEME.bg1}, ${THEME.bg2})`,
          color: THEME.text,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-4">
          <div className="text-5xl text-yellow-400">
            <FaUserCircle />
          </div>
          <div>
            <h2
              className="text-2xl font-bold tracking-wide"
              style={{ color: THEME.accent }}
            >
              Account Profile
            </h2>
            <p className="text-gray-400 text-sm">
              Manage your personal information and account details.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Editable fields */}
            <Field
              label="Full Name"
              value={user.name}
              onChange={(v) => setUser({ ...user, name: v })}
            />
            <Field
              label="Address"
              value={user.address}
              onChange={(v) => setUser({ ...user, address: v })}
            />
            <Field
              label="Phone Number"
              value={user.phone}
              onChange={(v) => setUser({ ...user, phone: v })}
            />

            {/* Non-editable */}
            <Field label="Email" value={user.email} disabled />
            <Field label="Sponsor" value={user.sponsor} disabled />
          </motion.div>
        )}

        {/* Save Button */}
        {!loading && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={saving}
            onClick={saveProfile}
            className="mt-8 w-full py-3 font-semibold rounded-lg text-lg transition-all duration-200"
            style={{
              background: saving
                ? "#555"
                : "linear-gradient(90deg, #E0B90B, #FCD535)",
              color: "#000",
              boxShadow: "0 0 12px rgba(240, 205, 35, 0.3)",
            }}
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </motion.button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 rounded-md text-sm bg-[#111418] border ${
          disabled
            ? "border-gray-700 text-gray-500 opacity-70"
            : "border-[#2f3136] focus:border-yellow-500 focus:ring-1 focus:ring-yellow-400"
        } transition-all duration-200 outline-none`}
      />
    </div>
  );
}
