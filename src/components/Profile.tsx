"use client";

import React, { useEffect, useState, useRef } from "react";
import { MdOutlineSecurity } from "react-icons/md";
import { ImProfile } from "react-icons/im";
import { BsPersonCircle } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

interface UserInfo {
  name: string;
  email: string;
}

interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const Profile = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { showToast } = useToast();

  const menuItems: MenuItem[] = [
    { label: "Profile", href: "/profile", icon: <ImProfile /> },
    { label: "Security", href: "/security", icon: <MdOutlineSecurity /> },
  ];

  // 🟢 Gọi API /api/user/me để lấy thông tin người dùng
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user info");
        const data = await res.json();

        setUser({
          name: data?.user?.name || data?.name || "BNBFund",
          email: data?.user?.email || data?.email || "bnbfund@email.com",
        });
      } catch (err) {
        console.error("fetchUser error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router, showToast]);

  // 🟣 Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Logout failed");
      }

      showToast("Logged out successfully", "success");
      localStorage.removeItem("token");
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      console.error("Logout error:", err);
      showToast(err.message || "Logout failed", "error");
      router.push("/login");
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={toggleDropdown}
        className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
        type="button"
      >
        <span className="sr-only">Open user menu</span>
        <BsPersonCircle
          fontSize={23}
          className="text-bnb-yellow cursor-pointer hover:text-bnb-gold"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-40 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600 mt-2">
          {/* User Info */}
          <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
            <div className="font-medium">{user?.name ?? "Name"}</div>
            <div className="font-semibold truncate text-bnb-gold">
              {user?.email ?? "email@gmail.com"}
            </div>
          </div>

          {/* Menu Items */}
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.href ? (
                  <a
                    href={item.href}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Sign Out */}
          <div className="py-2">
            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="block items-center gap-2 flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
            >
              <MdLogout /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
