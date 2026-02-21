"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type DealerLeadsRealtimeSyncProps = {
    dealerId: string;
    activeTab: "market" | "myleads";
};

export function DealerLeadsRealtimeSync({ dealerId, activeTab }: DealerLeadsRealtimeSyncProps) {
    const router = useRouter();
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const lastRefreshAtRef = useRef(0);

    useEffect(() => {
        if (!dealerId) return;

        const refreshWithThrottle = (showToast: boolean) => {
            const now = Date.now();
            if (now - lastRefreshAtRef.current < 1200) return;
            lastRefreshAtRef.current = now;

            if (showToast) {
                toast.success("New lead delivered in real-time");
            }
            router.refresh();
        };

        const allocationChannel = supabase
            .channel(`dealer-leads-allocation-${dealerId}`)
            .on(
                "postgres_changes" as any,
                {
                    event: "INSERT",
                    schema: "public",
                    table: "lead_allocations",
                    filter: `dealer_id=eq.${dealerId}`,
                },
                () => refreshWithThrottle(activeTab === "myleads")
            )
            .subscribe();

        const unlockChannel = supabase
            .channel(`dealer-leads-unlock-${dealerId}`)
            .on(
                "postgres_changes" as any,
                {
                    event: "INSERT",
                    schema: "public",
                    table: "unlock_events",
                    filter: `dealer_id=eq.${dealerId}`,
                },
                () => refreshWithThrottle(false)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(allocationChannel);
            supabase.removeChannel(unlockChannel);
        };
    }, [dealerId, activeTab, router, supabase]);

    return null;
}

