import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Handle Admin Login with Brute-Force Protection & Audit Logs
 * POST /api/auth/admin/login
 */
export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        // Internal Supabase Client (bypasses RLS for audit table)
        const supabaseAdmin = createClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || "",
            { auth: { persistSession: false } }
        );

        // 1. Brute-Force Check (Lockout window: 15 mins, Max attempts: 5)
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();
        const { count, error: countError } = await supabaseAdmin
            .from("auth_login_audit")
            .select('*', { count: 'exact', head: true })
            .eq("action", "login_failed")
            .eq("ip_address", ip)
            .gt("created_at", fifteenMinsAgo);

        if (countError) console.error("Audit fetch error", countError);

        if (count && count >= 5) {
            return NextResponse.json(
                { error: "Too many failed attempts. Account locked for 15 minutes." },
                { status: 429 }
            );
        }

        // 2. Attempt Login via normal auth logic (simulated validation to get user context)
        // Note: For secure auth, we just use signInWithPassword on the client or server. 
        // Here we validate the credentials against Supabase.
        const { data: authData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });

        if (loginError || !authData.user) {
            // Log Failure
            await supabaseAdmin.from("auth_login_audit").insert({
                action: "login_failed",
                ip_address: ip,
                user_agent: userAgent,
                status: "failure",
                error_message: loginError?.message || "Invalid credentials",
                metadata: { email }
            });

            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. Prevent non-admin logins via this route
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();

        if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
            await supabaseAdmin.from("auth_login_audit").insert({
                action: "login_failed",
                user_id: authData.user.id,
                ip_address: ip,
                user_agent: userAgent,
                status: "failure",
                error_message: "Unauthorized role",
                metadata: { email, role: profile?.role }
            });
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        // 4. Log Success
        await supabaseAdmin.from("auth_login_audit").insert({
            action: "login_success",
            user_id: authData.user.id,
            ip_address: ip,
            user_agent: userAgent,
            status: "success",
            metadata: { email, role: profile.role }
        });

        console.log(`[ADMIN_LOGIN_API] Success for ${email}`);

        return new NextResponse(JSON.stringify({
            success: true,
            message: "Login verified",
            user: {
                id: authData.user.id,
                email: authData.user.email,
                role: profile.role
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("[ADMIN_LOGIN_API] Critical Error:", error);
        return new NextResponse(JSON.stringify({
            error: "Internal Server Error",
            details: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
