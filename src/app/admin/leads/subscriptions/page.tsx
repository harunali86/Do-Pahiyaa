export const dynamic = "force-dynamic";

import { AdminService } from "@/lib/services/admin.service";
import { AdminSubscriptionTable } from "@/components/admin/leads/AdminSubscriptionTable";

export default async function AdminSubscriptionsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

    // Fetch subscriptions via AdminService
    const { subscriptions, metadata } = await AdminService.getAllSubscriptions({
        page,
        limit: 20,
        status
    });

    return (
        <div className="p-6 md:p-8 space-y-6 w-full">
            <AdminSubscriptionTable
                initialSubscriptions={subscriptions}
                metadata={metadata}
            />
        </div>
    );
}
