"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AuctionsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Auction Error]", error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4 max-w-md text-center p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
                <AlertTriangle className="h-12 w-12 text-red-400" />
                <h2 className="text-lg font-semibold text-white">Auction Error</h2>
                <p className="text-sm text-slate-400">
                    {error.message || "Something went wrong loading the auction."}
                </p>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
                >
                    <RefreshCw className="h-4 w-4" /> Try Again
                </button>
            </div>
        </div>
    );
}
