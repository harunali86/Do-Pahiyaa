import { z } from "zod";

const envSchema = z.object({
  // Made optional for Frontend Demo Build
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional().default("placeholder-key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional().default("placeholder-key"),
  RAZORPAY_KEY_ID: z.string().min(1).optional().default("rzp_test_placeholder"),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional().default("placeholder_secret"),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional().default("placeholder_secret"),
  APP_BASE_URL: z.string().url().optional().default("http://localhost:3000")
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  APP_BASE_URL: process.env.APP_BASE_URL
});

