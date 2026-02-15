import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-9xl font-black text-slate-800 select-none">404</h1>
            <div className="relative -top-10">
                <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    href="/"
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back Home
                </Link>
            </div>
        </div>
    );
}
