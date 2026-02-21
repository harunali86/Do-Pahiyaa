"use client";

import Link from "next/link";
import { ArrowRight, Building2, User } from "lucide-react";

export default function RoleSelectPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Choose Your Role</h1>
          <p className="text-slate-400">Configure your experience based on how you use Do Pahiyaa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/onboarding/profile-setup?role=buyer"
            className="group bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-brand-500/40 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center mb-4">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Buyer / Seller</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Browse inventory, place offers, manage saved bikes, and list your own bike.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-brand-400 text-sm font-semibold">
              Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/onboarding/profile-setup?role=dealer"
            className="group bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-brand-500/40 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Dealer</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Manage inventory, buy filtered leads, auto-allocation packs, and dealer analytics.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-brand-400 text-sm font-semibold">
              Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
