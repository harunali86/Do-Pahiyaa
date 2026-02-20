import { Clock, Search } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/authorization";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

type AuditLogRow = {
    id: string;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    ip_address: string | null;
    created_at: string;
    actor: { full_name?: string | null; role?: string | null } | { full_name?: string | null; role?: string | null }[] | null;
};

export default async function AuditLogsPage() {
    const supabase = await createSupabaseServerClient();
    const auth = await requireAdminAccess(supabase);

    if (!auth.ok) {
        if (auth.status === 401) redirect("/auth/login?next=/admin/audit-logs");
        redirect("/");
    }

    const { data } = await supabase
        .from("audit_logs")
        .select(`
            id,
            action,
            entity_type,
            entity_id,
            ip_address,
            created_at,
            actor:profiles(full_name, role)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

    const logs: AuditLogRow[] = (data || []) as AuditLogRow[];

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
                    <p className="text-slate-400">System activities, moderation events, and admin actions.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search in table (client-side browser find)"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50"
                        readOnly
                    />
                </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/50 text-slate-500 font-medium">
                        <tr>
                            <th className="p-4">Action</th>
                            <th className="p-4">Actor</th>
                            <th className="p-4">Entity</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                        {logs.map((log) => {
                            const actor = Array.isArray(log.actor) ? log.actor[0] : log.actor;
                            return (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-white">{log.action}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{actor?.full_name || "System"}</div>
                                        <div className="text-xs uppercase tracking-wider text-slate-500">{actor?.role || "service_role"}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-slate-200">{log.entity_type || "-"}</div>
                                        <div className="text-xs text-slate-500 font-mono">{log.entity_id || "-"}</div>
                                    </td>
                                    <td className="p-4 text-slate-500 font-mono">{log.ip_address || "-"}</td>
                                    <td className="p-4 text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-slate-600" />
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {logs.length === 0 && (
                            <tr>
                                <td className="p-10 text-center text-slate-500" colSpan={5}>
                                    No audit entries found yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
