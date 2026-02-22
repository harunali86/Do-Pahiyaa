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
        try {
            const res = await fetch("/api/v1/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: `91${phone}` }) // Ensure country code is prefixed
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");

            toast.success("OTP sent successfully to your WhatsApp!");
            setStep('otp');
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast.error("Please enter 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            // 1. Verify with our backend
            const res = await fetch("/api/v1/auth/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: `91${phone}`, otp })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");

            // 2. Establish Supabase Session with the returned secure session object
            const supabase = createSupabaseBrowserClient();
            const { error: loginError } = await supabase.auth.setSession(data.session);

            if (loginError) throw loginError;

            toast.success("Login Successful!");

            // 3. Sync Profile Phone (Optional but good practice)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ phone }).eq('id', user.id);

                // Redirect based on role
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

                if (profile?.role === 'dealer') router.push('/dealer/dashboard');
                else if (profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'super-admin') {
                    router.push('/admin');
                } else router.push('/');
            }
        } catch (error: any) {
            toast.error(error.message || "Invalid OTP");
        } finally {
            setLoading(false);
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
                            />
                        </div>
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
