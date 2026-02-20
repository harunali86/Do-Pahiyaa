"use client";

import { useState } from "react";
import BuyCreditsModal from "./BuyCreditsModal";

export default function BuyCreditsButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 rounded-lg bg-slate-800 border border-white/5 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
                Buy Credits
            </button>
            <BuyCreditsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
