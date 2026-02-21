"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function handleChange(index: number, value: string) {
    const cleanValue = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = cleanValue;
    setOtp(next);
    if (cleanValue && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleBackspace(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("Please enter complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);

    if (code !== "123456") {
      toast.error("Invalid OTP. Use 123456 for demo.");
      return;
    }

    setVerified(true);
    toast.success("OTP verified successfully.");
  }

  function resendOtp() {
    setOtp(new Array(OTP_LENGTH).fill(""));
    setSecondsLeft(30);
    inputRefs.current[0]?.focus();
    toast.success("OTP resent (demo mode).");
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-glass-gradient border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Verify OTP</h1>
        <p className="text-slate-400 text-center mb-6">Enter the 6-digit code sent to your mobile number.</p>

        {!verified ? (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleBackspace(index, event)}
                  className="w-11 h-12 rounded-xl border border-white/10 bg-slate-950/50 text-center text-white text-lg font-bold focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              ))}
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
                "Verify OTP"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-white font-semibold">Verification complete</p>
            <p className="text-sm text-slate-400 mt-1">You can now continue to onboarding.</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-white/5 text-sm flex items-center justify-between text-slate-400">
          <button
            type="button"
            onClick={resendOtp}
            disabled={secondsLeft > 0}
            className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            Resend OTP
          </button>
          <span>{secondsLeft > 0 ? `00:${String(secondsLeft).padStart(2, "0")}` : "Ready"}</span>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Demo OTP: <span className="text-slate-300 font-semibold">123456</span> •{" "}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
