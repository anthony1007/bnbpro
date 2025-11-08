"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUsers,
  FaPiggyBank,
  FaWallet,
  FaLifeRing,
  FaSignOutAlt,
} from "react-icons/fa";
import { THEME } from "@/lib/theme";

const navItems = [
  { label: "Dashboard", icon: <FaTachometerAlt />, href: "/dashboard" },
  { label: "Users", icon: <FaUsers />, href: "/user" },
  { label: "Funds", icon: <FaPiggyBank />, href: "/fund" },
  { label: "Wallets", icon: <FaWallet />, href: "/wallet" },
  { label: "Support", icon: <FaLifeRing />, href: "/support" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E11] text-[#EAECEF]">
      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ duration: 0.3 }}
            className="fixed z-40 lg:hidden bg-[#181A20] w-64 h-full shadow-2xl border-r border-[#2B3139]"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#2B3139]">
              <h1 className="text-xl font-bold text-[#FCD535]">BNBF Admin</h1>
              <FaTimes className="cursor-pointer text-gray-400" onClick={() => setOpen(false)} />
            </div>
            <nav className="mt-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ${
                    pathname === item.href
                      ? "bg-[#FCD535] text-black"
                      : "text-gray-300 hover:bg-[#1E2329] hover:text-[#FCD535]"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#181A20] border-r border-[#2B3139]">
        <div className="p-5 border-b border-[#2B3139]">
          <h1 className="text-xl font-bold text-[#FCD535]">BNBF Admin</h1>
        </div>
        <nav className="flex-1 mt-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium ${
                pathname === item.href
                  ? "bg-[#FCD535] text-black"
                  : "text-gray-300 hover:bg-[#1E2329] hover:text-[#FCD535]"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#2B3139]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-md bg-[#2B3139] hover:bg-[#F84960] hover:text-white text-gray-300"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-[#2B3139] bg-[#0B0E11]">
          <div className="flex items-center gap-3">
            <FaBars className="lg:hidden cursor-pointer text-gray-400" onClick={() => setOpen(true)} />
            <h2 className="text-lg font-semibold text-[#EAECEF]">Admin Panel</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">Hello, <span className="text-[#FCD535]">Admin</span></div>
            <img
              src="/images/admin-avatar.png"
              alt="Admin"
              className="w-9 h-9 rounded-full border border-[#FCD535]"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 bg-[#0B0E11] overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
