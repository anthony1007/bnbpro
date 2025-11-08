"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { THEME } from "@/lib/theme";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is BNBFund?",
    answer:
      "BNBFund is an AI-driven investment platform that leverages advanced algorithms and blockchain technology to generate optimized crypto investment returns for users while maintaining security and transparency.",
  },
  {
    question: "How does the AI investment engine work?",
    answer:
      "Our AI engine analyzes market structure, on-chain activity, volatility patterns, and macroeconomic indicators. It continuously rebalances portfolios and adjusts exposure to minimize drawdowns and capture profitable opportunities.",
  },
  {
    question: "Is my investment safe?",
    answer:
      "BNBFund employs institutional-grade security: cold wallet storage, multi-signature admin control, and audited smart contracts. All deposits and withdrawals are transparently recorded on-chain.",
  },
  {
    question: "What are the available investment plans?",
    answer:
      "We currently have many plans. Each plan has different profit levels and reward rates. You can explore them on our Investment Plans page or directly at BNBFund.",
  },
  {
    question: "When will BNBF Token be launched?",
    answer:
      "BNBF Token is scheduled for Q1 2026. It will introduce governance rights and staking rewards. Early investors may receive allocation bonuses during the pre-launch phase.",
  },
  {
    question: "What is BNBCard?",
    answer:
      "BNBCard (expected Q3 2026) will allow users to spend crypto directly while earning cashback in BNBF Token. It integrates seamlessly with user wallets and the BNBFund ecosystem.",
  },
  {
    question: "How do I contact support?",
    answer:
      "To reach support or open a ticket, please log in to your BNBFund account. You can submit a ticket under the 'Support' section, and our team will respond on 24h.",
  },
];

const AccordionItem: React.FC<{
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onClick: () => void;
}> = ({ item, index, isOpen, onClick }) => {
  return (
    <div className="border border-[#2B3139] rounded-xl bg-[#0C0F12] overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-gray-200 hover:bg-[#111418] transition-colors"
      >
        <span className="font-medium">{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={index}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div className="px-5 py-5 text-sm text-gray-400 border-t border-[#2B3139]">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <main
      className="min-h-screen py-20 px-6"
      style={{ background: THEME.bg, color: THEME.text }}
    >
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-extrabold mb-3"
            style={{ color: THEME.accent }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find answers to the most common questions about BNBFund’s technology,
            security, and investment process.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onClick={() => toggle(i)}
            />
          ))}
        </div>

        <div className="mt-10 text-center text-gray-400 text-sm">
          Still have questions?{" "}
          <a href="/login" className="text-yellow-400 hover:underline">
            Log in
          </a>{" "}
          to contact support or open a ticket.
        </div>
      </section>
    </main>
  );
}
