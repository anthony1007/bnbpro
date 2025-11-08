"use client";

import { useState } from "react";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { useToast } from "@/context/ToastContext";
import Input from "@/components/ui/Input";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function RegisterPage() {
  const { showToast } = useToast();
  const [showPass, setShowPass] = useState(true);
  const [showRepass, setShowRepass] = useState(true);
  const [form, setForm] = useState<RegisterInput>({
    email: "",
    name: "",
    password: "",
    repassword: "",
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const firstError = result.error.issues[0];
      showToast(firstError.message, "error");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Register failed");
      }
      showToast("Register success! Please login.", "success");
      window.location.href = "/login";
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error");
    }
  };

  return (
    <div className="flex flex-col items-center p-5 py-20 min-h-screen">
        <div className="flex flex-col flex-1 items-center justify-start w-full mf:mt-0 mt-10">
          <div className="p-5 sm:w-96 w-full flex flex-col justify-start items-center grey-border"> 
          <div className="text-xl text-bnb-gold pb-3 font-bold text-center">SIGN UP</div>
          <form onSubmit={handleSubmit}>
            <Input
              placeholder="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              placeholder="Full name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
            />
            <div className="inline-flex w-full">
              <Input placeholder="Password" name="password" value={form.password}
              type={showPass ? 'password' : 'text'} onChange={handleChange}/>
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="ml-[-35px] p-1 rounded-full"
              >
                {showPass ? 
                  <MdVisibility className="text-gray-500" /> : 
                  <MdVisibilityOff className="text-gray-500" />
                }
              </button>
            </div>
            <div className="inline-flex w-full">
              <Input placeholder="Retype Password" name="repassword" value={form.repassword}
              type={showRepass ? 'password' : 'text'} onChange={handleChange}/>
              <button
                type="button"
                onClick={() => setShowRepass(!showRepass)}
                className="ml-[-35px] p-1 rounded-full"
              >
                {showRepass ? 
                  <MdVisibility className="text-gray-500" /> : 
                  <MdVisibilityOff className="text-gray-500" />
                }
              </button>
            </div>

            <div className="flex items-start mt-2 mb-6">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={handleChange}
                  className="
                    w-4 h-4 border border-gray-300 rounded-sm
                    bg-gray-50 focus:ring-3 focus:ring-bnb-gold
                    checked:bg-bnb-gold
                    cursor-pointer
                  "
                />
              </div>
              <label
                htmlFor="agreeTerms"
                className="ml-2 text-sm font-medium text-gray-300"
              >
                By creating an account, I agree to BNBFund’s <br />
                <a href="#" className="text-gray-400 hover:underline mr-1">
                  Terms of Service
                </a>{" "}
                &
                <a href="#" className="text-gray-400 hover:underline ml-1">
                  Privacy Notice
                </a>
              </label>
            </div>

            <button
              type="submit"
              className={`
                text-black w-full border p-3 border-[#3d4f7c]
                rounded-xl cursor-pointer bg-bnb-yellow hover:bg-bnb-gold
              `}
            >
              Sign Up
            </button>
          </form>
        </div>

        <div className="p-5 sm:w-96 w-full flex flex-col items-center mt-4">
          <div className="w-full flex justify-between">
            <a className="text-bnb-gold" href="/login">
              Login
            </a>
            <a className="text-bnb-gold" href="/forgot-password">
              Forgot password
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
