"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function OTPLoginForm() {
    const router = useRouter();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) {
            toast.error("Please enter a valid 10-digit number");
            return;
        }

        setLoading(true);
        // Mock API call simulation
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setStep('otp');
        toast.success("OTP Sent: 123456 (Mock)");
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mock Verification
        if (otp !== "123456") {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.error("Invalid OTP");
            setLoading(false);
            return;
        }

        // Shadow Email Logic
        const shadowEmail = `phone_${phone}@mock.local`;
        const shadowPassword = "mock-otp-secret-123"; // Fixed secret for mock users

        const supabase = createSupabaseBrowserClient();

        // 1. Try Login
        let { data, error } = await supabase.auth.signInWithPassword({
            email: shadowEmail,
            password: shadowPassword,
        });

        // 2. If User Not Found -> Auto Sign Up
        if (error && error.message.includes("Invalid login")) {
            const signUpResult = await supabase.auth.signUp({
                email: shadowEmail,
                password: shadowPassword,
                options: {
                    data: {
                        full_name: `User ${phone}`,
                        phone: phone, // Store real phone in metadata
                        role: 'user', // Default role for OTP users
                    }
                }
            });

            if (signUpResult.error) {
                toast.error(signUpResult.error.message);
                setLoading(false);
                return;
            }
            // Auto Login after signup usually works, but check session
            data = signUpResult.data as any;
        } else if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        toast.success("Login Successful!");

        // 3. Sync Profile Phone (Optional but good practice)
        if (data.user) {
            await supabase.from('profiles').update({ phone: phone }).eq('id', data.user.id);

            // Redirect based on role
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
            if (profile?.role === 'dealer') router.push('/dealer/dashboard');
            else if (profile?.role === 'admin') router.push('/admin');
            else router.push('/');
        }
    };

    return (
        <div className="space-y-6">
            {step === 'phone' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Mobile Number</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-500 font-medium">+91</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600 font-mono text-lg"
                                placeholder="98765 43210"
                                required
                                autoFocus
                            />
                            <Phone className="absolute right-4 top-3.5 w-5 h-5 text-slate-600" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Get OTP <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center mb-4">
                        <p className="text-slate-400 text-sm">OTP sent to +91 {phone}</p>
                        <button
                            type="button"
                            onClick={() => setStep('phone')}
                            className="text-brand-400 text-xs font-bold hover:underline mt-1"
                        >
                            Change Number
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Enter OTP</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600 font-mono text-lg tracking-widest text-center"
                                placeholder="• • • • • •"
                                required
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-center text-slate-500 mt-2">Mock Code: <b>123456</b></p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify & Login <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
