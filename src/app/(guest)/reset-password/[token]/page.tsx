"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resetPasswordSchema } from "@/lib/validations";
import { useToast } from "@/context/ToastContext";
import Input from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({ password: "", repassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!token) {
        showToast("Invalid or missing reset token", "error");
        return;
      }

      // ✅ Validate form
      const result = resetPasswordSchema.safeParse({ ...form, token });
      if (!result.success) {
        const firstError =
          result.error.issues[0]?.message || "Invalid input data";
        showToast(firstError, "error");
        return;
      }

      setLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to reset password");
      }
      showToast("Password reset successfully!", "success");
      router.push("/login");
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-5 py-20">
      <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
        <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center grey-border">
          <div className="text-xl text-bnb-gold pb-3 font-bold">
            RESET PASSWORD
          </div>
          <form onSubmit={handleSubmit}>
            <Input
              placeholder="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />
            <Input
              placeholder="Retype password"
              name="repassword"
              type="password"
              value={form.repassword}
              onChange={handleChange}
            />
            <button
              type="submit"
              disabled={loading}
              className={`text-black w-full mt-4 border p-3 border-[#3d4f7c] rounded-xl cursor-pointer ${
                loading
                  ? "bg-gray-700 border-gray-500 text-white cursor-not-allowed"
                  : "bg-bnb-yellow border-[#3d4f7c] text-black hover:bg-[#E0B90B]"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
        <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center">
          <div className="w-full flex justify-between text-white">
            <a className="text-bnb-gold" href="/register">
              Create an account
            </a>
            <a className="text-bnb-gold" href="/login">
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
