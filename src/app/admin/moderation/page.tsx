export const dynamic = "force-dynamic";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ModerationTable } from "@/components/admin/moderation/ModerationTable";
import Link from "next/link";

interface AdminModerationPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function AdminModerationPage({ searchParams }: AdminModerationPageProps) {
  const resolvedParams = await searchParams;
  const rawPage = Array.isArray(resolvedParams.page) ? resolvedParams.page[0] : resolvedParams.page;
  const page = Math.max(1, Number(rawPage || 1));
  const limit = 200;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const admin = createSupabaseAdminClient();

  const { data: listings, error, count } = await admin
    .from("listings")
    .select(`
      *,
      seller:profiles!seller_id(id, full_name, email)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const pagedListings = listings || [];
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (error) {
    console.error("FetchModerationQueueError:", error);
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Listing Management</h1>
          <p className="text-slate-400">Manage all bike listings on the platform. Search, filter, and control live content.</p>
        </div>
        <div className="text-sm text-slate-400">
          Showing {Math.min(from + 1, total)} - {Math.min(from + pagedListings.length, total)} of {total}
        </div>
      </div>

      <ModerationTable listings={pagedListings} />

      <div className="flex items-center justify-end gap-3">
        {hasPrev ? (
          <Link
            href={`/admin/moderation?page=${page - 1}`}
            className="px-3 py-2 rounded-md text-sm bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800"
          >
            Previous
          </Link>
        ) : null}
        {hasNext ? (
          <Link
            href={`/admin/moderation?page=${page + 1}`}
            className="px-3 py-2 rounded-md text-sm bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800"
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
