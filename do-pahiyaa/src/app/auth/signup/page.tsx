"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Building2, CheckCircle2 } from "lucide-react";
import OTPLoginForm from "@/components/auth/OTPLoginForm";
import DealerKycForm from "@/components/auth/DealerKycForm";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "sonner";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function SignupPage() {
    const router = useRouter();
    const [role, setRole] = useState<'buyer' | 'dealer'>('buyer');
    const [step, setStep] = useState<'account' | 'kyc'>('account');
    const [createdUserId, setCreatedUserId] = useState<string | null>(null);

    // After OTP LoginForm succeeds, we need to catch the session and advance to KYC if Dealer
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createSupabaseBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user && step === 'account') {
                // The OTPLoginForm just logged the user in.
                // If they signed up as a dealer, we need to show the KYC form now.
                if (role === 'dealer') {
                    setCreatedUserId(session.user.id);

                    // Update their role in the profiles table to 'dealer' (it defaults to 'buyer')
                    const { error } = await supabase
                        .from('profiles')
                        .update({ role: 'dealer', is_verified: false })
                        .eq('id', session.user.id);

                    if (error) {
                        console.error("Failed to update role:", error);
                    }

                    setStep('kyc');
                } else {
                    // Buyers are good to go, redirect to home
                    router.push('/');
                    router.refresh();
                }
            }
        };

        // Listen for auth state changes triggered by OTPLoginForm completion
        const supabase = createSupabaseBrowserClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                checkSession();
            }
        });

        // Initial check just in case they are already logged in
        checkSession();

        return () => subscription.unsubscribe();
    }, [role, step, router]);

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {step === 'account' ? 'Create Account' : 'Verify Business'}
                    </h1>
                    <p className="text-slate-400">
                        {step === 'account'
                            ? "Join India's premium bike marketplace securely with WhatsApp"
                            : "Mandatory KYC for Verified Dealers"}
                    </p>
                </div>

                <div className="bg-glass-gradient border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">

                    {step === 'account' ? (
                        <>
                            {/* Role Selection Tabs */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    type="button"
                                    onClick={() => setRole('buyer')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'buyer'
                                        ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10'
                                        }`}
                                >
                                    <User className="w-6 h-6" />
                                    <div className="text-center">
                                        <div className="font-bold text-sm">Individual</div>
                                        <div className="text-[10px] opacity-70">Buy & Sell Bikes</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('dealer')}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'dealer'
                                        ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                                        : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10'
                                        }`}
                                >
                                    <Building2 className="w-6 h-6" />
                                    <div className="text-center">
                                        <div className="font-bold text-sm">Dealer</div>
                                        <div className="text-[10px] opacity-70">Manage Inventory</div>
                                    </div>
                                </button>
                            </div>

                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                <OTPLoginForm isSignup={true} />

                                {/* Google Signup Divider */}
                                <div className="flex items-center gap-3 my-5">
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-xs text-slate-500 font-medium">OR</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>
                                <GoogleAuthButton
                                    role={role}
                                    label={role === 'dealer' ? 'Sign up as Dealer with Google' : 'Sign up with Google'}
                                />
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <p className="text-slate-400 text-sm">
                                    Already have an account?{' '}
                                    <Link href="/auth/login" className="text-brand-400 font-bold hover:underline">
                                        Log In
                                    </Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            <DealerKycForm
                                userId={createdUserId!}
                                onComplete={() => {
                                    toast.success("KYC Submitted! Our team will review your account.");
                                    router.push('/dealer/dashboard');
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 flex justify-center gap-6 text-xs text-slate-500 opacity-60">
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> WhatsApp Secure Verification
                    </div>
                </div>
            </div>
        </div>
    );
}
