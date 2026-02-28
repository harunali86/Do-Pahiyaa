import { z } from "zod";

const envSchema = z.object({
  // Non-blocking for build (Dummy fallbacks provided below)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("http://127.0.0.1"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default("dummy-anon-key"),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().default("624142304626-3quhbhedm3mq4rksohd2nk6fvqnli0u8.apps.googleusercontent.com"),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default("dummy-service-role-key"),

  // Razorpay (Optional for Demo)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // WhatsApp (Optional for Demo)
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),

  // App Config
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  OTP_SHADOW_SECRET: z.string().default("dopahiyaa-secure-otp-auth-2026")
});

const rawEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || undefined,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || undefined,
  // Server-only keys
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || undefined,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || undefined,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || undefined,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || undefined,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || undefined,
  APP_BASE_URL: process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : (process.env.APP_BASE_URL || undefined),
  OTP_SHADOW_SECRET: process.env.OTP_SHADOW_SECRET || undefined
};

// Use safeParse to prevent runtime crash on boot
const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error("❌ Environment Validation Failed. Using fallbacks.", parsed.error.format());
}

export const env = parsed.success ? parsed.data : envSchema.parse({});


