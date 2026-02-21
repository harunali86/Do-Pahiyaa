import { AlertTriangle, BadgeCheck, Eye, ShieldCheck } from "lucide-react";

const safetyPrinciples = [
  {
    title: "Verified Listings",
    desc: "Every premium listing goes through document and media checks before wider visibility.",
    icon: BadgeCheck,
  },
  {
    title: "Fraud Detection",
    desc: "Lead, payment, and bidding workflows include anomaly checks and manual override controls.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent History",
    desc: "Deal timeline, unlock events, and audit logs are tracked for accountability.",
    icon: Eye,
  },
  {
    title: "Escalation Support",
    desc: "Users can report suspicious activity directly to moderation and support teams.",
    icon: AlertTriangle,
  },
];

export default function TrustSafetyPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-10">
      <section className="text-center">
        <h1 className="text-4xl font-black text-white mb-4">Trust & Safety</h1>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Do Pahiyaa is built to keep buyers, sellers, and dealers safe across listings, leads, auctions, and payments.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {safetyPrinciples.map(({ title, desc, icon: Icon }) => (
          <div key={title} className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center mb-4">
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-xl text-white font-bold mb-2">{title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-glass-gradient border border-white/10 rounded-2xl p-6 space-y-3">
        <h3 className="text-white text-xl font-bold">Report a Safety Concern</h3>
        <p className="text-sm text-slate-400">
          For urgent fraud or abuse reports, contact <span className="text-white">safety@dopahiyaa.com</span> with listing/deal ID and screenshots.
        </p>
      </section>
    </div>
  );
}
