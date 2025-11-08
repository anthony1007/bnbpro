"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function LogoutButton() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { 
        method: "POST" , 
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Logout failed");
      }
      showToast("Logged out successfully", "success");
      localStorage.removeItem('token');
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      showToast(err.message || "Logout failed", "error");
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
    >Logout
    </button>
  );
}
