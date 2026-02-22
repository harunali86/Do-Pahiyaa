export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/authorization";
import { ConfigService } from "@/lib/services/config.service";
import { FeatureFlagsManager } from "@/components/admin/FeatureFlagsManager";

export default async function AdminFeatureFlagsPage() {
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdminAccess(supabase);
  if (!auth.ok) {
    if (auth.status === 401) redirect("/auth/login?next=/admin/feature-flags");
    redirect("/");
  }

  const configs = await ConfigService.getAllConfig();

  return (
    <div className="p-6 md:p-8">
      <FeatureFlagsManager initialConfigs={configs} />
    </div>
  );
}
