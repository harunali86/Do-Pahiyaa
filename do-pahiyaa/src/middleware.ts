import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit } from "@/lib/rate-limit";
import { isAdminRole, isDealerOrAdminRole } from "@/lib/auth/authorization";
import { env } from "@/lib/env";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Add security headers (Constitution §5.5)
    const SECURITY_HEADERS: Record<string, string> = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
        "X-DNS-Prefetch-Control": "on",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
        "Content-Security-Policy": [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com",
            "frame-src https://api.razorpay.com https://checkout.razorpay.com",
        ].join("; "),
    };

    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(key, value);
    }

    // 1. Public routes bypass (webhooks, OTP API — no auth needed)
    const publicBypass = [
        "/api/v1/webhooks/",
        "/api/v1/auth/otp/",
    ];
    if (publicBypass.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
        return response;
    }

    // 2. Supabase Session Setup
    const supabase = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

        {
            cookies: {
                getAll() {
                    return request.cookies.getAll().map((cookie) => ({
                        name: cookie.name,
                        value: cookie.value,
                    }))
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },

            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname;

    // 3. Application Logic (Rate Limiting)
    // Skip static files for rate limiting
    if (!path.startsWith("/_next") && !path.includes(".")) {
        const isApiRoute = path.startsWith("/api");
        const isAuthRoute = path.startsWith("/auth");
        const limitType = isApiRoute ? "purchase" : isAuthRoute ? "auth" : "public";

        // In demo mode, we might not have 'check_rate_limit' RPC, so we handle degradation
        const result = await rateLimit(request, limitType);
        if (!result.success) {
            return new NextResponse("Too Many Requests", { status: 429 });
        }
    }

    // 3. Routing Rules (Auth/RBAC)
    const isAuthPage = path.startsWith('/auth')
    const isAdminPage = path.startsWith('/admin')
    const isDealerPage = path.startsWith('/dealer') || path.startsWith('/seller')
    const isBuyerDashboard = path.startsWith('/buyer')

    // Redirect authenticated users away from login/signup
    if (user && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Handle protected dashboard routes
    if (isAdminPage || isDealerPage || isBuyerDashboard) {
        if (!user) {
            return NextResponse.redirect(new URL(`/auth/login?next=${encodeURIComponent(path)}`, request.url));
        }

        // Role verification (from profiles)
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        if (!profile) {
            // If logged in but no profile, send to onboarding settings
            if (path !== "/settings/profile") {
                return NextResponse.redirect(new URL("/settings/profile", request.url));
            }
            return response;
        }

        const role = profile.role || 'user';

        if (isAdminPage && !isAdminRole(role)) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        if (isDealerPage && !isDealerOrAdminRole(role)) {
            return NextResponse.redirect(new URL('/sell', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
