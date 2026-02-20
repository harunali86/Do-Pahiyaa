import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeadService } from "@/lib/services/lead.service";
import { AnalyticsCharts } from "@/components/dealer/AnalyticsCharts";
import { TrendingUp, Users, CheckCircle } from "lucide-react";

export default async function DealerAnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch Analytics Data
  const analyticsData = await LeadService.getLeadAnalytics(user.id);

  // Calculate Totals for period
  const totalLeadsPeriod = analyticsData.reduce((acc, curr) => acc + curr.leads, 0);
  const totalConversionsPeriod = analyticsData.reduce((acc, curr) => acc + curr.conversions, 0);
  const conversionRate = totalLeadsPeriod > 0 ? Math.round((totalConversionsPeriod / totalLeadsPeriod) * 100) : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-slate-400">Performance insights for the last 30 days</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-white/5 rounded-xl bg-slate-900/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">New Leads (30 Days)</p>
              <p className="text-2xl font-bold text-white">{totalLeadsPeriod}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 rounded-xl bg-slate-900/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Unlocked Leads</p>
              <p className="text-2xl font-bold text-white">{totalConversionsPeriod}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 rounded-xl bg-slate-900/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <AnalyticsCharts data={analyticsData} />

      {analyticsData.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">
          No data available for the selected period. Start getting leads to see insights!
        </div>
      )}
    </div>
  );
}
