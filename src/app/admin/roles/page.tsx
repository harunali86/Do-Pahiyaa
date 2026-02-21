export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminAccess } from "@/lib/auth/authorization";

type RoleCount = {
  user: number;
  dealer: number;
  admin: number;
  super_admin: number;
};

export default async function AdminRolesPage() {
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdminAccess(supabase);
  if (!auth.ok) {
    if (auth.status === 401) redirect("/auth/login?next=/admin/roles");
    redirect("/");
  }

  const admin = createSupabaseAdminClient();
  const { data: users } = await admin.from("profiles").select("role").limit(10000);

  const counts: RoleCount = { user: 0, dealer: 0, admin: 0, super_admin: 0 };
  for (const item of users || []) {
    const role = item.role as keyof RoleCount;
    if (role in counts) counts[role] += 1;
  }

  const effectiveAdminCount = counts.admin + counts.super_admin;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Role Governance</h1>
          <p className="text-slate-400">Current phase uses a unified admin control model.</p>
        </div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
        >
          Manage Users
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel border border-white/5 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Buyers</p>
          <p className="text-2xl font-bold text-white mt-2">{counts.user}</p>
        </div>
        <div className="glass-panel border border-white/5 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Dealers</p>
          <p className="text-2xl font-bold text-white mt-2">{counts.dealer}</p>
        </div>
        <div className="glass-panel border border-white/5 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Admins (Effective)</p>
          <p className="text-2xl font-bold text-brand-400 mt-2">{effectiveAdminCount}</p>
        </div>
        <div className="glass-panel border border-white/5 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Super Admin</p>
          <p className="text-2xl font-bold text-purple-400 mt-2">{counts.super_admin}</p>
        </div>
      </div>

      <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            Active Permission Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Capability</th>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Dealer</th>
                <th className="px-5 py-3">Admin (Current)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {[
                ["Listings create/edit", "Own", "Own", "All own inventory", "All"],
                ["Lead unlock", "No", "No", "Yes", "Override"],
                ["Auction operations", "Bid only", "List own", "Bid + settle own", "Start/Pause/Cancel"],
                ["Pricing controls", "No", "No", "No", "Full access"],
                ["User moderation", "No", "No", "No", "Full access"],
              ].map((row) => (
                <tr key={row[0]} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white font-medium">{row[0]}</td>
                  <td className="px-5 py-3 text-slate-300">{row[1]}</td>
                  <td className="px-5 py-3 text-slate-300">{row[2]}</td>
                  <td className="px-5 py-3 text-slate-300">{row[3]}</td>
                  <td className="px-5 py-3 text-brand-400 font-medium">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-4 text-sm text-yellow-200 flex items-start gap-3">
        <Users className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Current phase: <span className="font-semibold">Admin and Super Admin are treated as unified control</span>. Later phase can split policy and approval boundaries without breaking existing routes.
        </p>
      </div>
    </div>
  );
}
