import { z } from "zod";

const envSchema = z.object({
  // Strict Validation - No Defaults for Production Keys
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Supabase URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase Anon Key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase Service Role Key is required"),

  // Razorpay (Required for Payments)
  RAZORPAY_KEY_ID: z.string().min(1, "Razorpay Key ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "Razorpay Secret is required"),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, "Razorpay Webhook Secret is required"),

  // App Config
  APP_BASE_URL: z.string().url().default("http://localhost:3000")
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // Server-only keys (allow undefined on client)
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || (typeof window !== 'undefined' ? "dummy_key_for_client" : undefined),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || (typeof window !== 'undefined' ? "dummy_key_for_client" : undefined),
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || (typeof window !== 'undefined' ? "dummy_key_for_client" : undefined),
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || (typeof window !== 'undefined' ? "dummy_key_for_client" : undefined),
  APP_BASE_URL: process.env.APP_BASE_URL
});

