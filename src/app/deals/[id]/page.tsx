import { notFound } from "next/navigation";
import { DealService } from "@/lib/services/deal.service";
import DealClient from "@/components/marketplace/DealClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DealPage({ params }: PageProps) {
    const { id } = await params;

    let deal: any = null;
    try {
        deal = await DealService.getDealById(id);
    } catch (e) {
        console.error("Deal Fetch Error:", e);
        // Fallback or 404
        notFound();
    }

    if (!deal) {
        notFound();
    }

    return (
        <div className="min-h-screen py-8 max-w-5xl mx-auto">
            <DealClient initialDeal={deal} />
        </div>
    );
}
