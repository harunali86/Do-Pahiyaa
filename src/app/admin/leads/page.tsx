export const dynamic = "force-dynamic";

import { LeadService } from "@/lib/services/lead.service";
import { AdminLeadsTable } from "@/components/admin/leads/AdminLeadsTable";

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
    const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;
    const make = typeof resolvedParams.make === 'string' ? resolvedParams.make : undefined;
    const city = typeof resolvedParams.city === 'string' ? resolvedParams.city : undefined;

    // Fetch Paginated Leads
    const { leads, metadata } = await LeadService.getAllAdminLeads({
        page,
        limit: 20,
        search,
        status,
        make,
        city
    });

    return (
        <div className="p-6 md:p-8 space-y-6 w-full">
            <AdminLeadsTable
                initialLeads={leads}
                metadata={metadata}
            />
        </div>
    );
}
