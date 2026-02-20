"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    Loader2,
    Building2
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "sonner";
import DealerKycForm from "@/components/auth/DealerKycForm";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<'buyer' | 'dealer'>('buyer');
    const [step, setStep] = useState<'account' | 'kyc'>('account');
    const [createdUserId, setCreatedUserId] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const fullName = formData.get("fullName") as string;

        try {
            const supabase = createSupabaseBrowserClient();

            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });

            if (authError) throw authError;

            // 2. Create Profile
            if (authData.user) {
                setCreatedUserId(authData.user.id);
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        email: email,
                        full_name: fullName,
                        role: role,
                        status: role === 'dealer' ? 'pending_verification' : 'active'
                    });

                if (profileError && !profileError.message.includes('duplicate key')) {
                    console.error(profileError);
                }
            }

            toast.success("Account created!");

            // 3. Handle multi-step for dealers
            if (role === 'dealer') {
                setStep('kyc');
            } else {
                toast.success("Redirecting...");
                router.push('/');
                router.refresh();
            }

        } catch (error: any) {
            toast.error(error.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {step === 'account' ? 'Create Account' : 'Verify Business'}
                    </h1>
                    <p className="text-slate-400">
                        {step === 'account'
                            ? "Join India's premium bike marketplace"
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

                            <form onSubmit={handleSignup} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                                        <input
                                            name="fullName"
                                            type="text"
                                            placeholder="Rahul Sharma"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="rahul@example.com"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                                        <input
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 px-1">
                                        Must be at least 8 characters long.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Get Started <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

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
                        <DealerKycForm
                            userId={createdUserId!}
                            onComplete={() => {
                                toast.success("KYC Submitted! Our team will review your account.");
                                router.push('/dealer/dashboard');
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
