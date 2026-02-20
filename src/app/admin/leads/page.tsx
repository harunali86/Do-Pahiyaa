export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";

import { LeadService } from "@/lib/services/lead.service";
import { AdminLeadsTable } from "@/components/admin/leads/AdminLeadsTable";

interface AdminLeadsPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
    const page = Number(searchParams.page) || 1;
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
    const make = typeof searchParams.make === 'string' ? searchParams.make : undefined;
    const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;

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
