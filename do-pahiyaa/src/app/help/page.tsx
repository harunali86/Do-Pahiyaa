import Link from "next/link";
import { ChevronRight, LifeBuoy, MessageCircle, ShieldCheck } from "lucide-react";

const faq = [
  {
    q: "How does lead unlock work?",
    a: "Dealers can unlock a lead instantly from Buy Leads. Contact details become visible after successful payment.",
  },
  {
    q: "Can I bid in live auctions without being a dealer?",
    a: "For now, verified dealer accounts can place auction bids. Buyer mode can watch and shortlist.",
  },
  {
    q: "How do I report fraud or fake listing?",
    a: "Use the listing report button or contact support. Admin moderation queue reviews reports in priority order.",
  },
  {
    q: "How fast are new leads delivered?",
    a: "Lead delivery is real-time through subscription matching and dealer lead allocation rules.",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-10">
      <section className="text-center space-y-3">
        <h1 className="text-4xl font-black text-white">Help Center</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Quick answers for buyers, sellers, dealers, and auction participants.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel border border-white/5 rounded-xl p-5">
          <LifeBuoy className="w-5 h-5 text-brand-400 mb-3" />
          <h2 className="text-white font-semibold">Support</h2>
          <p className="text-sm text-slate-400 mt-2">Get platform assistance for onboarding, deals, and payouts.</p>
        </div>
        <div className="glass-panel border border-white/5 rounded-xl p-5">
          <ShieldCheck className="w-5 h-5 text-green-400 mb-3" />
          <h2 className="text-white font-semibold">Trust & Safety</h2>
          <p className="text-sm text-slate-400 mt-2">Fraud prevention, identity verification, and moderation standards.</p>
        </div>
        <div className="glass-panel border border-white/5 rounded-xl p-5">
          <MessageCircle className="w-5 h-5 text-blue-400 mb-3" />
          <h2 className="text-white font-semibold">Contact Team</h2>
          <p className="text-sm text-slate-400 mt-2">Use support chat, email, or call flow for critical ticket escalation.</p>
        </div>
      </section>

      <section className="glass-panel border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-white/5">
          {faq.map((item) => (
            <div key={item.q} className="px-6 py-5">
              <p className="text-white font-medium">{item.q}</p>
              <p className="text-slate-400 text-sm mt-2">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel border border-brand-500/20 bg-brand-500/5 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold">Need direct support?</h3>
          <p className="text-slate-400 text-sm">If issue is urgent, reach us through contact desk.</p>
        </div>
        <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-white text-sm font-semibold hover:bg-brand-500">
          Contact Support
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
