export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConfigService } from "@/lib/services/config.service";
import { PricingCards } from "@/components/dealer/PricingCards";
import Script from "next/script";

export default async function CreditsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get Pricing Config
    const leadPrice = await ConfigService.getConfigNumber("lead_unlock_price", 1);
    const minQty = await ConfigService.getConfigNumber("min_leads_purchase", 100);
    const gstRate = await ConfigService.getConfigNumber("gst_rate_percent", 18);

    // Get Current Balance
    const { data: dealer } = await supabase.from('dealers').select('credits_balance').eq('profile_id', user?.id).single();
    const balance = dealer?.credits_balance || 0;

    return (
        <div className="p-6 md:p-8 space-y-8 w-full min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Add Funds</h1>
                    <p className="text-slate-400 text-sm">Purchase credits to unlock more buyer leads.</p>
                </div>
                <div className="bg-slate-900 border border-brand-500/20 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-brand-500/5">
                    <span className="text-slate-400 text-sm">Current Balance:</span>
                    <span className="text-white font-bold text-lg">₹{balance.toLocaleString()}</span>
                </div>
            </div>

            {/* Pricing Logic Section */}
            <PricingCards
                leadPrice={leadPrice}
                minQty={minQty}
                gstRate={gstRate}
                razorpayKeyId={process.env.RAZORPAY_KEY_ID || ""}
            />

            {/* Razorpay Script */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        </div>
    );
}
