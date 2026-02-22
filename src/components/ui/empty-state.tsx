import { SearchX } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    icon?: any;
}

export default function EmptyState({
    title = "No results found",
    description = "We couldn't find what you're looking for. Try adjusting your search.",
    actionLabel,
    actionHref,
    icon: Icon = SearchX
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Icon className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 max-w-sm mx-auto mb-8 text-sm leading-relaxed">
                {description}
            </p>
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
