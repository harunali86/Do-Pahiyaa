"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Boundary Caught:", error);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                <AlertTriangle className="w-24 h-24 text-red-500 relative z-10 animate-pulse" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">Something went wrong!</h1>
            <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                We encountered an unexpected error. Our team has been notified.
                <br />
                <span className="text-xs font-mono text-slate-600 mt-2 block">
                    Error ID: {error.digest || 'Unknown'}
                </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={reset}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:scale-100 active:scale-95"
                >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                </button>

                <Link
                    href="/"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                    <Home className="w-4 h-4 text-slate-400" />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
