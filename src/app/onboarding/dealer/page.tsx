import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, UploadCloud } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DealerOnboardingPage() {
  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white mb-3">Dealer Onboarding</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Complete business verification to activate inventory publishing and pre-purchased lead allocation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5">
          <UploadCloud className="w-6 h-6 text-brand-400 mb-3" />
          <h2 className="text-white font-bold mb-2">Upload KYC</h2>
          <p className="text-sm text-slate-400">Business proof, identity proof, and PAN document upload.</p>
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5">
          <ShieldCheck className="w-6 h-6 text-brand-400 mb-3" />
          <h2 className="text-white font-bold mb-2">Admin Review</h2>
          <p className="text-sm text-slate-400">Status moves from pending_verification to active after checks.</p>
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5">
          <BadgeCheck className="w-6 h-6 text-brand-400 mb-3" />
          <h2 className="text-white font-bold mb-2">Start Selling</h2>
          <p className="text-sm text-slate-400">Publish inventory and buy filtered lead packs from dealer panel.</p>
        </div>
      </div>

      <div className="bg-glass-gradient border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold">Ready for activation?</h3>
          <p className="text-sm text-slate-400">If signup is complete, continue to dealer dashboard and KYC review flow.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/signup" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold">
            Open Signup
          </Link>
          <Link href="/dealer/dashboard" className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold inline-flex items-center gap-2">
            Dealer Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
