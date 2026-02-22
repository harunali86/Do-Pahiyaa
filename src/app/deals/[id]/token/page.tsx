export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { DealService } from "@/lib/services/deal.service";
import { formatINR } from "@/lib/utils";

interface DealTokenPageProps {
  params: Promise<{ id: string }>;
}

function computeBookingToken(deal: any) {
  const offerAmount = Number(deal?.offer?.amount || deal?.listing?.price || 0);
  const calculated = Math.round(offerAmount * 0.02);
  return Math.max(calculated, 2500);
}

export default async function DealTokenPage({ params }: DealTokenPageProps) {
  const { id } = await params;

  let deal: any = null;
  try {
    deal = await DealService.getDealById(id);
  } catch {
    notFound();
  }

  if (!deal) notFound();

  const bookingToken = computeBookingToken(deal);
  const totalPrice = Number(deal?.offer?.amount || deal?.listing?.price || 0);

  return (
    <div className="min-h-screen py-8 max-w-5xl mx-auto space-y-6">
      <Link href={`/deals/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Deal
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Booking Token</h1>
            <p className="text-slate-400">Pay token amount to reserve the bike and lock seller commitment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Bike Value</p>
              <p className="text-xl font-bold text-white mt-2">{formatINR(totalPrice)}</p>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Token Payable</p>
              <p className="text-xl font-bold text-brand-400 mt-2">{formatINR(bookingToken)}</p>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Deal ID</p>
              <p className="text-xl font-bold text-white mt-2">#{deal.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">Lifecycle after token payment</h2>
            <div className="space-y-3">
              {[
                "Token paid and seller notified instantly",
                "Physical inspection slot gets confirmed",
                "Final payment and transfer documentation",
                "Deal closure with audit event",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass-panel border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-white">Secure Checkout</h3>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Razorpay secure token flow
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Wallet className="w-4 h-4 text-brand-400" />
              Refund path governed by policy
            </div>
            <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pay Token (Demo)
            </button>
            <p className="text-[11px] text-slate-500">
              Payment gateway integration remains in test mode until production cutover.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
