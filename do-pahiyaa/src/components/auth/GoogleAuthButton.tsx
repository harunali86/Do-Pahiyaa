"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "sonner";
import Script from "next/script";

interface GoogleAuthButtonProps {
    role?: "buyer" | "dealer";
    label?: string;
}

// Extend Window for Google Identity Services types
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    cancel: () => void;
                };
            };
        };
    }
}

import { env } from "@/lib/env";

const GOOGLE_CLIENT_ID = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleAuthButton({
    role = "buyer",
    label = "Continue with Google",
}: GoogleAuthButtonProps) {
    const [loading, setLoading] = useState(false);
    const [gsiReady, setGsiReady] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next") ?? "/";
    const roleRef = useRef(role);

    // Keep role ref in sync since Google callback is registered once
    useEffect(() => {
        roleRef.current = role;
    }, [role]);

    // Handle the Google credential response
    const handleCredentialResponse = useCallback(
        async (response: { credential: string }) => {
            setLoading(true);
            try {
                const supabase = createSupabaseBrowserClient();

                // Exchange Google ID token with Supabase for session
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: "google",
                    token: response.credential,
                });

                if (error) throw error;

                const user = data.user;
                if (!user) throw new Error("Login failed — no user returned");

                // Upsert profile (creates on first login, updates avatar/email on returning)
                const currentRole = roleRef.current;
                await supabase.from("profiles").upsert(
                    {
                        id: user.id,
                        full_name:
                            user.user_metadata?.full_name ??
                            user.user_metadata?.name ??
                            "",
                        email: user.email ?? "",
                        avatar_url: user.user_metadata?.avatar_url ?? "",
                        role: currentRole,
                        phone: "",
                        is_verified: false,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "id", ignoreDuplicates: false }
                );

                // Fetch actual role from DB (source of truth for returning users)
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                const actualRole = profile?.role ?? "buyer";

                toast.success("Welcome! Logged in with Google");

                // Role-based redirect
                if (next && next !== "/" && next.startsWith("/")) {
                    router.push(next);
                } else if (actualRole === "dealer") {
                    router.push("/dealer/dashboard");
                } else if (
                    actualRole === "admin" ||
                    actualRole === "super_admin" ||
                    actualRole === "super-admin"
                ) {
                    router.push("/admin");
                } else {
                    router.push("/");
                }
                router.refresh();
            } catch (error: any) {
                toast.error(
                    error.message || "Google login failed. Please try again."
                );
                setLoading(false);
            }
        },
        [next, router]
    );

    // Initialize Google Identity Services when script loads
    const handleGsiLoad = useCallback(() => {
        if (!window.google || !GOOGLE_CLIENT_ID) return;
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
        });
        setGsiReady(true);
    }, [handleCredentialResponse]);

    // Trigger Google One Tap / popup on button click
    const handleClick = () => {
        if (!window.google || !gsiReady) {
            toast.error("Google Sign-In is loading, please try again.");
            return;
        }
        setLoading(true);
        window.google.accounts.id.prompt((notification: any) => {
            // If user dismissed or skipped, reset loading
            if (
                notification.isNotDisplayed() ||
                notification.isSkippedMoment() ||
                notification.isDismissedMoment()
            ) {
                setLoading(false);
            }
        });
    };

    return (
        <>
            {/* Load Google Identity Services Script */}
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={handleGsiLoad}
            />

            <button
                type="button"
                onClick={handleClick}
                disabled={loading || !GOOGLE_CLIENT_ID}
                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Signing in...</span>
                    </>
                ) : (
                    <>
                        {/* Google Logo SVG */}
                        <svg
                            className="w-5 h-5 flex-shrink-0"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span>{label}</span>
                    </>
                )}
            </button>
        </>
    );
}
