// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import { PiHandDepositFill, PiHandWithdrawFill } from "react-icons/pi";
// import { FaHistory } from "react-icons/fa";
// import { RiWallet3Fill } from "react-icons/ri";
// import { useToast } from "@/context/ToastContext";

// interface MenuItem {
//   label: string;
//   href?: string;
//   onClick?: () => void;
//   icon?: React.ReactNode;
// }

// const Wallet = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [balance, setBalance] = useState<string>("0.00");
//   const { showToast } = useToast();
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const menuItems: MenuItem[] = [
//     { label: "Deposit", href: "/deposit", icon: <PiHandDepositFill /> },
//     { label: "Withdraw", href: "/withdraw", icon: <PiHandWithdrawFill /> },
//   ];

//   // 🔹 Fetch balance từ /api/user/me
//   const fetchBalance = async () => {
//     try {
//       const res = await fetch("/api/user/me", { credentials: "include" });
//       const data = await res.json();

//       if (!res.ok) throw new Error(data.error || "Failed to load user");

//       // ✅ linh hoạt đọc balance
//       const user = data.user ?? data;
//       const raw = user.balanceWei ?? user.balance ?? user.walletBalance ?? 0;

//       // nếu là BigInt string thì chia 1e18
//       const value = typeof raw === "string" ? Number(BigInt(raw)) / 1e18 : Number(raw);

//       setBalance(value.toFixed(6));
//     } catch (err) {
//       console.error("Failed to fetch balance:", err);
//       showToast("Failed to load wallet balance", "error");
//     }
//   };

//   useEffect(() => {
//     fetchBalance();
//     const interval = setInterval(fetchBalance, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // 🔹 Đóng dropdown khi click ra ngoài
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const toggleDropdown = () => setIsOpen(!isOpen);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={toggleDropdown}
//         className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
//       >
//         <RiWallet3Fill fontSize={23} className="text-bnb-yellow hover:text-bnb-gold" />
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 z-40 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600 mt-2">
//           <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
//             <div className="font-medium">Current Balance</div>
//             <div className="font-semibold text-bnb-gold">${balance}</div>
//           </div>

//           <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
//             {menuItems.map((item, index) => (
//               <li key={index}>
//                 <a
//                   href={item.href}
//                   className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
//                   onClick={() => setIsOpen(false)}
//                 >
//                   {item.icon && <span className="mr-2">{item.icon}</span>}
//                   {item.label}
//                 </a>
//               </li>
//             ))}
//           </ul>

//           <div className="py-2">
//             <a
//               href="/history"
//               onClick={() => setIsOpen(false)}
//               className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//               <FaHistory /> History
//             </a>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Wallet;


"use client";

import React, { useEffect, useState, useRef } from "react";
import { PiHandDepositFill, PiHandWithdrawFill } from "react-icons/pi";
import { FaHistory } from "react-icons/fa";
import { RiWallet3Fill } from "react-icons/ri";
import { useToast } from "@/context/ToastContext";

interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const Wallet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState<string>("0.00");
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    { label: "Deposit", href: "/deposit", icon: <PiHandDepositFill /> },
    { label: "Withdraw", href: "/withdraw", icon: <PiHandWithdrawFill /> },
  ];

  // 🔹 Fetch balance từ /api/user/me
  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/user/me", { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load user");

      // ✅ linh hoạt đọc balance
      const user = data.user ?? data;
      const raw = user.balanceWei ?? user.balance ?? user.walletBalance ?? 0;

      // nếu là BigInt string thì chia 1e18
      const value = typeof raw === "string" ? Number(BigInt(raw)) / 1e18 : Number(raw);

      setBalance(value.toFixed(6));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      showToast("Failed to load wallet balance", "error");
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (!res.ok) return;
        const j = await res.json();
        const balWei = j.user?.balanceWei ?? "0";
        const value = typeof balWei === "string" ? Number(BigInt(balWei)) / 1e18 : Number(balWei);
        setBalance(`${value.toFixed(6)}`);
      } catch (err) {
        console.error("wallet load error", err);
        showToast("Failed to load wallet", "error");
      }
    };
    fetchBalance();
    const id = setInterval(fetchBalance, 10000);
    return () => clearInterval(id);
  }, [showToast]);

  // 🔹 Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
      >
        <RiWallet3Fill fontSize={23} className="text-bnb-yellow hover:text-bnb-gold" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-40 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600 mt-2">
          <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
            <div className="font-medium">Current Balance</div>
            <div className="font-semibold text-bnb-gold">{balance}</div>
          </div>

          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="py-2">
            <a
              href="/history"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaHistory /> History
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
