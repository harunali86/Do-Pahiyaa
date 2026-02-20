import { AdminService } from "@/lib/services/admin.service";
import { UsersClient } from "@/components/admin/UsersClient";

interface UsersPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
    const page = Number(searchParams.page) || 1;
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const role = typeof searchParams.role === 'string' ? searchParams.role : undefined;

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
