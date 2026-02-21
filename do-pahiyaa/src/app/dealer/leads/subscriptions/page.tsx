export const dynamic = "force-dynamic";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActiveSubscriptions } from "@/components/dealer/ActiveSubscriptions";
import { redirect } from "next/navigation";

export default async function SubscriptionsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: subscriptions, error } = await supabase
        .from("dealer_subscriptions")
        .select("*")
        .eq("dealer_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Fetch subscriptions error:", error);
    }

    return (
        <div className="p-6 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white">My Subscriptions</h1>
                <p className="text-slate-400">Track and manage your active lead filter packs.</p>
            </div>

            <ActiveSubscriptions subscriptions={subscriptions || []} />

            {!subscriptions?.length && (
                <div className="py-20 text-center glass-panel border-white/5 bg-slate-900/50 rounded-xl">
                    <p className="text-slate-500 mb-4">You have no active lead packs.</p>
                    <a
                        href="/dealer/leads/purchase"
                        className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition-colors"
                    >
                        Browse Lead Packs
                    </a>
                </div>
            )}
        </div>
    );
}
