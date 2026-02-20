"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "sonner";

import OTPLoginForm from "@/components/auth/OTPLoginForm";

export default function LoginPage() {
    const router = useRouter();
    const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // --- MOCK LOGIN FOR DEMO (Requested by User) ---
        if (email === 'admin@dopahiyaa.com' && password === 'admin123') {
            toast.success("Login Successful (Demo Mode)");
            router.push('/admin');
            setIsLoading(false);
            return;
        }
        if (email === 'dealer@dopahiyaa.com' && password === 'dealer123') {
            toast.success("Login Successful (Demo Mode)");
            router.push('/dealer/dashboard');
            setIsLoading(false);
            return;
        }
        // ----------------------------------------------

        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            // ... rest of the existing logic


            // Fetch role to redirect correctly
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user?.id)
                .single();

            toast.success("Welcome back!");

            if (profile?.role === 'dealer') {
                router.push('/dealer/dashboard');
            } else if (profile?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/'); // Buyer goes to home
            }
        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Sign in to continue to Do Pahiyaa</p>
                </div>

                {/* Login Method Switcher */}
                <div className="bg-slate-900/50 p-1 rounded-xl mb-8 flex border border-white/5">
                    <button
                        onClick={() => setLoginMethod('mobile')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'mobile'
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Mobile Number
                    </button>
                    <button
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'email'
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Email / Admin
                    </button>
                </div>

                {/* Form Container */}
                <div className="bg-glass-gradient border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />

                    {loginMethod === 'mobile' ? (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                            <div className="mb-4">
                                <p className="text-slate-400 text-sm mb-4">
                                    Login with your phone number to access your Buyer or Dealer account.
                                </p>
                            </div>
                            <OTPLoginForm />
                        </div>
                    ) : (
                        <form onSubmit={handleEmailLogin} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="user@example.com"
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
                                <div className="flex justify-end">
                                    <Link href="/auth/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-white/5"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        Sign In with Email <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="text-brand-400 font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 flex justify-center gap-6 text-xs text-slate-500 opacity-60">
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Secure Login
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Encrypted Data
                    </div>
                </div>
            </div>
        </div>
    );
}
