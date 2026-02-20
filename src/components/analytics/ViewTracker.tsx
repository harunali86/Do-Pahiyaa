"use client";

import { useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ViewTracker({ listingId }: { listingId: string }) {
    const trackedRef = useRef(false);

    useEffect(() => {
        if (trackedRef.current) return;

        const trackView = async () => {
            // Simple deduplication using session storage avoiding re-count on refresh in same session
            const storageKey = `viewed_${listingId}`;
            if (sessionStorage.getItem(storageKey)) return;

            const supabase = createSupabaseBrowserClient();
            await supabase.rpc('increment_listing_view', { listing_id: listingId });

            sessionStorage.setItem(storageKey, 'true');
            trackedRef.current = true;
        };

        trackView();
    }, [listingId]);

    return null; // Invisible component
}
