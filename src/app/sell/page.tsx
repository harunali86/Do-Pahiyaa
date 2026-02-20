"use client";

import Link from "next/link";
import { Camera, CheckCircle2 } from "lucide-react";

export default function SellPage() {
    return (
        <div className="min-h-screen py-12 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-20" />
                <Camera className="h-24 w-24 text-white relative z-10" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Sell Your Bike in <span className="text-brand-400">Minutes</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mb-12">
                Get the best price for your ride. Our AI-driven pricing engine and Verified Dealer network ensures you sell fast and secure.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-left">
                <div className="p-6 rounded-2xl bg-slate-900 border border-white/5">
                    <CheckCircle2 className="h-8 w-8 text-brand-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Instant Valuation</h3>
                    <p className="text-slate-400">Enter your bike details and get a fair market price range instantly.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-white/5">
                    <CheckCircle2 className="h-8 w-8 text-brand-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Verified Buyers</h3>
                    <p className="text-slate-400">Deal only with KYC-verified dealers and individuals to avoid scams.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-white/5">
                    <CheckCircle2 className="h-8 w-8 text-brand-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Secure Payment</h3>
                    <p className="text-slate-400">Funds are held in escrow until listing is transferred securely.</p>
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
                <Link
                    href="/seller/listings/new"
                    className="px-8 py-4 rounded-xl bg-brand-600 font-bold text-white text-lg shadow-xl shadow-brand-500/20 hover:bg-brand-500 transition-all active:scale-95 inline-block"
                >
                    Start Listing Flow
                </Link>
            </div>
        </div>
    );
}
