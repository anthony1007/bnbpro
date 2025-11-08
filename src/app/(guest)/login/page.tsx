"use client";

import { useState } from "react";
import { loginSchema, LoginInput } from "@/lib/validations";
import { useToast } from "@/context/ToastContext";
import Input from "@/components/ui/Input";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function LoginPage() {
  const { showToast } = useToast();
  const [showBalance, setShowBalance] = useState(true);
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const firstError = result.error.issues[0];
      showToast(firstError.message, "error");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      showToast("Login successful!", "success");
      window.location.href = "/overview";
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error");
    }
  };

  return (      
    <>
      <div className="flex flex-col items-center p-5 py-20 min-h-screen">
        <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
          <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center grey-border">          
            <div className="text-xl text-bnb-gold pb-3 font-bold">LOG IN</div>
            <form onSubmit={handleSubmit}>
              <Input placeholder="Email" name="email" type="text" value={form.email} onChange={handleChange}/>
              <div className="inline-flex w-full">
                <Input placeholder="Password" name="password" value={form.password}
                type={showBalance ? 'password' : 'text'} onChange={handleChange}/>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="ml-[-35px] p-1 rounded-full"
                >
                  {showBalance ? 
                    <MdVisibility className="text-gray-500" /> : 
                    <MdVisibilityOff className="text-gray-500" />
                  }
                </button>
              </div>
              <button
                type="submit"
                className="text-black w-full mt-4 border p-3 border-[#3d4f7c] hover:bg-[#E0B90B] bg-bnb-yellow rounded-xl cursor-pointer"
              >Log in
              </button>
            </form>
          </div>
          <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center">
            <div className="w-full flex justify-between text-white">
              <a className="text-bnb-gold" href="register">Create a account</a>
              <a className="text-bnb-gold" href="forgot-password">Forgot password</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}