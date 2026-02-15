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

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<'buyer' | 'dealer'>('buyer');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            if (role === 'dealer') {
                router.push('/dealer/dashboard');
            } else {
                router.push('/buyer/dashboard');
            }
        }, 1500);
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Sign in to continue to Do Pahiyaa</p>
                </div>

                {/* Role Switcher */}
                <div className="bg-slate-900/50 p-1 rounded-xl mb-8 flex border border-white/5">
                    <button
                        onClick={() => setRole('buyer')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'buyer'
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Buyer / Seller
                    </button>
                    <button
                        onClick={() => setRole('dealer')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'dealer'
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Dealer Partner
                    </button>
                </div>

                {/* Form */}
                <div className="bg-glass-gradient border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
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
                            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

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
