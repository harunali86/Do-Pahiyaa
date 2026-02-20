export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LeadService } from "@/lib/services/lead.service";
import { ModerationTable } from "@/components/admin/moderation/ModerationTable";

export default async function AdminModerationPage() {
  const admin = createSupabaseAdminClient();

  // Fetch ALL listings for management/moderation
  const { data: listings, error } = await admin
    .from("listings")
    .select(`
      *,
      seller:profiles!seller_id(id, full_name, email)
    `)
    .order("created_at", { ascending: false });

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
      </div>

      <ModerationTable listings={listings || []} />
    </div>
  );
}

