"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageCircle } from "lucide-react";
import LeadCaptureModal from "@/components/marketplace/LeadCaptureModal";

interface LeadCaptureButtonProps {
    listingId: string;
    listingTitle: string;
}

export default function LeadCaptureButton({ listingId, listingTitle }: LeadCaptureButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
                <MessageCircle className="h-5 w-5" />
                Contact Seller
            </button>

            {mounted && typeof document !== 'undefined' && createPortal(
                <LeadCaptureModal
                    listingId={listingId}
                    listingTitle={listingTitle}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />,
                document.body
            )}
        </>
    );
}
