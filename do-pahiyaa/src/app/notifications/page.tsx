export const dynamic = "force-dynamic";

import Link from "next/link";
import { Bell, CalendarDays, CheckCircle2 } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
        <p className="text-slate-400 mb-5">Please login to view your notifications.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-white font-semibold hover:bg-brand-500">
          Go to Login
        </Link>
      </div>
    );
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, message, type, is_read, created_at, link")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">Platform alerts, lead updates, deal events, and admin announcements.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
        {(notifications || []).length === 0 ? (
          <div className="text-center py-16 px-6">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h2 className="text-white font-semibold mb-1">No notifications yet</h2>
            <p className="text-sm text-slate-400">You will see lead allocations, auction updates, and deal changes here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {notifications!.map((item) => (
              <li key={item.id} className="px-5 py-4 hover:bg-white/[0.02]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-400 mt-1">{item.message}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex rounded-full px-2 py-0.5 border border-white/10 uppercase tracking-wide">{item.type}</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  {item.link && (
                    <Link href={item.link} className="text-brand-400 text-sm hover:text-brand-300">
                      Open
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
