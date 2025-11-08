
"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import LogoutButton from "@/components/ui/LogoutButton";
import { FaImages, FaSignOutAlt, FaUsers, FaWallet } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { RiFundsBoxFill, RiFundsFill } from "react-icons/ri";

type Props = {};

const DrawerWithBackdrop: React.FC<Props> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const openDrawer = () => {
    setIsOpen(true);
  };
  const closeDrawer = () => {
    setIsOpen(false);
  };
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <>
      {/* nút mở drawer */}
      <div className="text-center">
        <button
          className="p-3"
          type="button"
          onClick={openDrawer}
          aria-controls="drawer-backdrop"
        ><Image src="/bnbfund.png" alt="Logo" width={150} height={50} priority className="cursor-pointer ml-3"/>
        </button>
      </div>

      {/* backdrop + drawer */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        aria-hidden={!isOpen}
      />

      <div
        ref={drawerRef}
        id="drawer-backdrop"
        className={`fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform bg-bnb-black w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        tabIndex={-1}
        aria-labelledby="drawer-backdrop-label"
      >
        <h5
          id="drawer-backdrop-label"
          className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
        >
          Menu
        </h5>
        <button
          type="button"
          onClick={closeDrawer}
          aria-controls="drawer-backdrop"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
        ><IoClose
          className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
        /><span className="sr-only">Close menu</span>
        </button>

        <div className="py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            <li>
              <a href="/dashboard"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              ><MdDashboard
                className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              /><span className="ms-3">Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/user"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              ><FaUsers 
                className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              /><span className="ms-3">Users</span>
              </a>
            </li>
            <li>
              <a href="/funds"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              ><RiFundsBoxFill   
                className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              /><span className="ms-3">Funds</span>
              </a>
            </li>
            <li>
              <a href="/images"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              ><FaImages    
                className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              /><span className="ms-3">Images</span>
              </a>
            </li>
            <li>
              <a href="wallet"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              ><FaWallet   
                className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              /><span className="ms-3">Wallets</span>
              </a>
            </li>
            <li>
              <a href="withdraws"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              ><FaWallet   
                className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              /><span className="ms-3">Withdraws</span>
              </a>
            </li>


            {/* <li>
              <button
                type="button"
                className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                onClick={toggleDropdown}
                aria-controls="dropdown-example"
              >
                <svg
                  className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 21"
                >
                  <path d="M15 12a1 1 0 0 0 .962-.726l2-7A1 1 0 0 0 17 3H3.77L3.175.745A1 1 0 0 0 2.208 0H1a1 1 0 0 0 0 2h.438l.6 2.255v.019l2 7 .746 2.986A3 3 0 1 0 9 17a2.966 2.966 0 0 0-.184-1h2.368c-.118.32-.18.659-.184 1a3 3 0 1 0 3-3H6.78l-.5-2H15Z" />
                </svg>
                <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
                  E-commerce
                </span>
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              <ul
                id="dropdown-example"
                className={`py-2 space-y-2 ${dropdownOpen ? "block" : "hidden"}`}
              >
                <li>
                  <a
                    href="#"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Billing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Invoice
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 18"
                >
                  <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Kanban</span>
                <span className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  Pro
                </span>
              </a>
            </li> */}
            <li>
              <a href="#"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              ><FaSignOutAlt
                className="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              /><span className="flex-1 ms-3 whitespace-nowrap"><LogoutButton /></span>
              </a>
            </li>    
          </ul>
        </div>
      </div>
    </>
  );
};

export default DrawerWithBackdrop;

