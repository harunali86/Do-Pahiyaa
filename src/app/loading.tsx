import { Component } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                <p className="text-slate-400 animate-pulse">Loading Do Pahiyaa...</p>
            </div>
        </div>
    );
}
