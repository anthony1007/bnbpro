"use client";

import React, { useState } from "react";
import { forgotPasswordSchema } from "@/lib/validations";
import { ZodError } from "zod";
import { useToast } from "@/context/ToastContext";
import Input from "@/components/ui/Input";
import router from "next/router";

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ Client validation
      forgotPasswordSchema.parse(form);

      setLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }
      showToast("Reset link has been sent to your email.", "success");
      router.push("/reset-password");
    } catch (err: any) {
      if (err instanceof ZodError) {
        err.issues.forEach((e) => showToast(e.message, "error"));
      } else {
        showToast(err.message || "Something went wrong", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-5 py-20">
      <div className="flex flex-col flex-1 items-center justify-start w-full mt-10">
        <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center grey-border">
          <div className="text-xl text-bnb-gold pb-3 font-bold">
            FORGOT PASSWORD
          </div>
          <form onSubmit={handleSubmit} className="w-full">
            <Input
              placeholder="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 border-[1px] p-3 rounded-[12px] cursor-pointer ${
                loading
                  ? "bg-gray-700 border-gray-500 text-white cursor-not-allowed"
                  : "bg-bnb-yellow border-[#3d4f7c] text-black hover:bg-[#E0B90B]"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>

        <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center">
          <div className="w-full flex justify-between text-white">
            <a className="text-bnb-gold" href="register">
              Create an account
            </a>
            <a className="text-bnb-gold" href="login">
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
