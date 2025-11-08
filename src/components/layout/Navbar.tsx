"use client";
import React from "react";
import Image from "next/image";
import { NavBarItemProps } from "@/types";
import { TfiMenu } from "react-icons/tfi";
import { IoCloseSharp, IoHomeOutline } from "react-icons/io5";
import { RiRefund2Fill } from "react-icons/ri";
import { BsCreditCard } from "react-icons/bs";
import { BiSupport } from "react-icons/bi";

const NavBarItem = ({ title, classprops }: NavBarItemProps) => (
  <li className={`font-[600] hover:text-bnb-gold text-sm cursor-pointer ${classprops || ''}`}>{title}</li>
);

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = React.useState(false);

  return (
    <nav className="w-full flex md:justify-center justify-between items-center p-3 mr-5 fixed bg-[#181a20] z-50">
      <div className="md:flex-1 flex-initial justify-center items-center">
        <a href="/">
          <Image src="/bnbfund.png" alt="Logo" width={150} height={50} priority className="cursor-pointer ml-3"/>
        </a>
      </div>
      <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial gap-x-4">
        <li>
          <a className="text-white text-sm hover:text-bnb-gold" href="/">Home</a>
        </li>
        <li>
          <a className="text-white text-sm hover:text-bnb-gold" href="bnbfund">BNBFund</a>
        </li>
        <li>
          <a className="text-white text-sm hover:text-bnb-gold" href="faq">FAQ</a>
        </li>
        <li>
          <a className="text-white text-sm hover:text-bnb-gold" href="support">Support</a>
        </li>
        <li>
          <a className="btn pt-2 pb-2 pl-3 pr-3 text-white text-sm rounded-[5px] bg-gray-700 hover:bg-gray-800" href="login">Log In</a>
        </li>
        <li>
          <a className="btn p-2 text-black text-sm rounded-[5px] bg-bnb-yellow hover:bg-bnb-gold" href="register">Sign Up</a>
        </li>
        {/* <li>
          <MdOutlineLanguage fontSize={23} className="text-white cursor-pointer hover:text-bnb-gold" />
        </li>
        <li>
          <HiOutlineMoon fontSize={23} className="text-white cursor-pointer hover:text-bnb-gold" />
        </li> */}
      </ul>
      <div className="flex relative">
        {!toggleMenu && (
          <TfiMenu fontSize={23} className="text-white md:hidden cursor-pointer hover:text-bnb-gold" onClick={() => setToggleMenu(true)} />
        )}
        {toggleMenu && (
          <IoCloseSharp fontSize={23} className="text-white md:hidden cursor-pointer hover:text-bnb-gold" onClick={() => setToggleMenu(false)} />
        )}
        {toggleMenu && (
          <ul
            className="z-10 p-2 fixed -top-0 -right-2 w-screen h-screen shadow-2xl md:hidden list-none
            flex flex-col justify-items-start items-start bg-[#181a20] text-white animate-slide-in gap-y-5"
          >
            <div className="flex justify-between w-full gap-x-2">
            <li className="justify-items-start">
              <a href="/">
                <img src="bnbfund.png" alt="logo" className="w-[225px] mt-1 cursor-pointer ml-2" />
              </a>
            </li>
            <li className="text-xl flex-row w-full pt-3 pr-2 justify-items-end">
              <IoCloseSharp className="cursor-pointer hover:text-bnb-gold" fontSize={32} onClick={() => setToggleMenu(false)} />
            </li>
            </div>
            <div className="inline-flex w-full gap-x-2 pr-[35px]">
            <li className="w-1/2 py-2">
              <a className="btn pt-2 pb-2 pl-3 pr-3 text-white text-sm rounded-[5px] bg-gray-700 hover:bg-gray-800" href="login">
                <button className="w-full">Log In</button></a>
            </li>
            <li className="w-1/2 py-2">
              <a className="btn p-2 w-full text-black text-sm rounded-[5px] bg-bnb-yellow hover:bg-bnb-gold" href="register">
                <button className="w-full">Sign Up</button></a>
            </li>
            </div>
            <li className="flex flex-row gap-x-2 py-2">
              <IoHomeOutline fontSize={23} className="text-gray-500 hover:text-bnb-gold"/>
              <a className="text-white text-sm hover:text-bnb-gold" href="/">Home</a>
            </li>
            <li className="flex flex-row gap-x-2 py-2">
              <RiRefund2Fill fontSize={23} className="text-gray-500 hover:text-bnb-gold"/>
              <a className="text-white text-sm hover:text-bnb-gold" href="bnbfund">BNBFund</a>
            </li>
            <li className="flex flex-row gap-x-2 py-2">
              <BsCreditCard fontSize={23} className="text-gray-500 hover:text-bnb-gold"/>
              <a className="text-white text-sm hover:text-bnb-gold" href="bnbcard">BNBCard</a>
            </li>
            <li className="flex flex-row gap-x-2 py-2">
              <BiSupport fontSize={23} className="text-gray-500 hover:text-bnb-gold"/>
              <a className="text-white text-sm hover:text-bnb-gold" href="support">Support</a>
            </li>
            {/* <li className="flex flex-row gap-x-2 py-2">
              <MdOutlineLanguage fontSize={23} className="text-gray-500 hover:text-bnb-gold"/> 
              <p className="text-white text-sm hover:text-bnb-gold">English</p>
            </li>
            <li className="flex flex-row gap-x-2 py-2">
              <HiOutlineMoon fontSize={23} className="text-gray-500 hover:text-bnb-gold"/>
              <p className="text-white text-sm hover:text-bnb-gold">Theme</p>
            </li> */}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
