import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";
    // role param sent by GoogleAuthButton for signup intent (buyer vs dealer)
    const roleIntent = (searchParams.get("role") ?? "buyer") as "buyer" | "dealer";

    if (code) {
        const supabase = await createSupabaseServerClient();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!exchangeError) {
            // Get the authenticated user after session exchange
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                return NextResponse.redirect(`${origin}/auth/auth-code-error`);
            }

            // Upsert profile — creates on first Google login, no-op for returning users
            // onConflict: 'id' ensures we NEVER overwrite existing role/data
            await supabase.from("profiles").upsert(
                {
                    id: user.id,
                    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
                    email: user.email ?? "",
                    avatar_url: user.user_metadata?.avatar_url ?? "",
                    role: roleIntent,     // Only applied on INSERT (new users)
                    phone: "",
                    is_verified: false,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "id",
                    ignoreDuplicates: false, // Update avatar/email on each login
                }
            );

            // Fetch actual role from DB (source of truth — not the URL param)
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            const role = profile?.role ?? "buyer";

            // Role-based redirect
            if (next && next !== "/" && next.startsWith("/")) {
                return NextResponse.redirect(`${origin}${next}`);
            }

            if (role === "dealer") {
                return NextResponse.redirect(`${origin}/dealer/dashboard`);
            }
            if (role === "admin" || role === "super_admin" || role === "super-admin") {
                return NextResponse.redirect(`${origin}/admin`);
            }
            // Buyer (default)
            return NextResponse.redirect(`${origin}/`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
