import { NextRequest, NextResponse } from "next/server";
import { OTPService } from "@/lib/services/otp.service";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * API Route to verify OTP and sign in/up user
 * POST /api/auth/otp/verify
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

        // 2. Supabase Shadow Login / Auto-Signup
        // We use a "shadow email" pattern for phone-based auth in standard Supabase setup 
        // if native Phone Auth is not enabled/configured.
        const shadowEmail = `phone_${phone.replace(/\D/g, "")}@dopahiyaa.local`;
        const shadowPassword = process.env.OTP_SHADOW_SECRET || "dopahiyaa-secure-otp-auth-2026";

        const supabase = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || "",
            { auth: { persistSession: false } }
        );

        // Check if user exists
        let { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        let targetUser = users?.find(u => u.email === shadowEmail);

        if (!targetUser) {
            // Auto Sign Up
            const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
                email: shadowEmail,
                password: shadowPassword,
                email_confirm: true,
                user_metadata: { phone, role: 'buyer' } // Default role
            });

            if (signUpError) throw signUpError;
            targetUser = newUser.user;

            // Create Profile
            await supabase.from("profiles").insert({
                id: targetUser.id,
                phone: phone,
                role: 'buyer'
            });
        }

        // 3. Create Session (Using Supabase Auth Admin to get a token or redirect to a bridge)
        // Since we are in a Route Handler, we need to return something the frontend can use or set a cookie.
        // Best practice: Return the email/password for the frontend to call signInWithPassword securely,
        // OR use Supabase admin to create a magic link/one-time-login-token.

        // Audit Success
        await supabase.from("auth_login_audit").insert({
            user_id: targetUser.id,
            phone,
            action: "login_success",
            ip_address: ip,
            user_agent: userAgent,
            status: "success"
        });

        return NextResponse.json({
            success: true,
            email: shadowEmail,
            password: shadowPassword, // This is a fixed secret for OTP users
            message: "OTP Verified"
        });
    } catch (error: any) {
        console.error("[OTP_VERIFY_API] Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
