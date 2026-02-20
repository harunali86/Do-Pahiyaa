export const dynamic = "force-dynamic";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminService } from "@/lib/services/admin.service";
import { UsersClient } from "@/components/admin/UsersClient";

interface UsersPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
    const role = typeof resolvedParams.role === 'string' ? resolvedParams.role : undefined;


    // Fetch Paginated Users
    const { users, metadata } = await AdminService.getPaginatedUsers({
        page,
        limit: 20,
        search,
        role
    });

    return (
        <div className="p-6 md:p-8 space-y-6 w-full">
            <UsersClient
                initialUsers={users}
                metadata={metadata}
            />
        </div>
    );
}
