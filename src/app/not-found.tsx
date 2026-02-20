import Link from "next/link";
import { ArrowLeft, MapPinOff, SearchX, Home, Bike } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full" />
                <MapPinOff className="w-24 h-24 text-slate-700 relative z-10 animate-pulse" />
            </div>

            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-800 select-none mb-2">404</h1>
            <h2 className="text-2xl font-bold text-white mb-4">You&apos;ve gone off-road!</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                The page you are looking for seems to have taken a different turn. It might have been removed or is temporarily unavailable.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                <Link
                    href="/"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group"
                >
                    <Home className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    Go Home
                </Link>
                <Link
                    href="/buy-used-bikes"
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 group"
                >
                    <Bike className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Find a Bike
                </Link>
            </div>
        </div>
    );
}
