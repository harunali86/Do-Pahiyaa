import { NextRequest, NextResponse } from "next/server";
import { OTPService } from "@/lib/services/otp.service";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { env } from "@/lib/env";
import { cookies } from "next/headers";

/**
 * API Route to verify OTP and sign in/up user
 * POST /api/v1/auth/otp/verify
 */
export async function POST(req: NextRequest) {
    try {
        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        // 1. Verify OTP with DB
        const result = await OTPService.verifyOTP(phone, otp);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 401 });
        }

        // 2. Supabase Admin Setup
        const supabaseAdmin = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || "",
            { auth: { persistSession: false } }
        );

        // 3. Shadow Login / Auto-Signup
        const shadowEmail = `phone_${phone.replace(/\D/g, "")}@dopahiyaa.local`;
        const shadowPassword = env.OTP_SHADOW_SECRET;

        // Check if user exists
        let { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        let targetUser = users?.find(u => u.email === shadowEmail);

        if (!targetUser) {
            // Auto Sign Up
            const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
                email: shadowEmail,
                password: shadowPassword,
                email_confirm: true,
                user_metadata: { phone, role: 'buyer' } // Default role
            });

            if (signUpError) throw signUpError;
            targetUser = newUser.user;

            // Create Profile
            await supabaseAdmin.from("profiles").insert({
                id: targetUser.id,
                phone: phone,
                role: 'buyer'
            });
        }

        // 4. Secure Session Creation (Server-Side)
        // Sign in on the server to get a session
        const { data: { session }, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
            email: shadowEmail,
            password: shadowPassword,
        });

        if (signInError || !session) {
            throw new Error("Failed to create secure session");
        }

        // 5. Audit Success
        await supabaseAdmin.from("auth_login_audit").insert({
            user_id: targetUser.id,
            phone,
            action: "login_success",
            ip_address: ip,
            user_agent: userAgent,
            status: "success"
        });

        // 6. Return Session (Securely)
        // We return the session object. The client-side Supabase client will call setSession
        // This is safe because the shadowPassword never leaves the server.
        return NextResponse.json({
            success: true,
            session,
            message: "Authentication Successful"
        });

    } catch (error: any) {
        console.error("[OTP_VERIFY_API] Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
