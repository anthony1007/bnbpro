import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Invalid email format" })
  .max(100, { message: "Email must not exceed 100 characters" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(64, { message: "Password must not exceed 64 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least 1 lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
  .regex(/[\W_]/, { message: "Password must contain at least 1 special character" });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Full name must be at least 2 characters" })
  .max(50, { message: "Full name must not exceed 50 characters" })
  .regex(/^[a-zA-ZÀ-ỹ\s'-]+$/, {
    message: "Full name must only contain letters, spaces, apostrophes, or hyphens",
  });

export const registerSchema = z
  .object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema,
    repassword: z.string().min(1, { message: "Please confirm your password" }),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept Terms & Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.repassword, {
    message: "Passwords do not match",
    path: ["repassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 number")
      .regex(/[\W_]/, "Password must contain at least 1 special character"),
    repassword: z.string().min(1, "Please retype your password"),
  })
  .refine((data) => data.password === data.repassword, {
    message: "Passwords do not match",
    path: ["repassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
