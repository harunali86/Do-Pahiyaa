"use client";

import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, IndianRupee, XCircle } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenueSeriesPoint = {
  label: string;
  revenue: number;
  transactions: number;
};

type RevenueSummary = {
  grossRevenue: number;
  leadRevenue: number;
  subscriptionRevenue: number;
  auctionRevenue: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
};

type RevenueTxn = {
  id: string;
  created_at: string;
  type: string;
  status: string;
  amount: number;
  dealer_id: string | null;
};

interface RevenueInsightsClientProps {
  weeklySeries: RevenueSeriesPoint[];
  monthlySeries: RevenueSeriesPoint[];
  yearlySeries: RevenueSeriesPoint[];
  summary: RevenueSummary;
  recentTransactions: RevenueTxn[];
}

const fmtINR = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export function RevenueInsightsClient({
  weeklySeries,
  monthlySeries,
  yearlySeries,
  summary,
  recentTransactions,
}: RevenueInsightsClientProps) {
  const [range, setRange] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const chartData = useMemo(() => {
    if (range === "weekly") return weeklySeries;
    if (range === "yearly") return yearlySeries;
    return monthlySeries;
  }, [range, weeklySeries, monthlySeries, yearlySeries]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Revenue Intelligence</h1>
          <p className="text-slate-400">Weekly / monthly / yearly timeline with transaction health.</p>
        </div>
        <div className="inline-flex rounded-xl border border-white/10 bg-slate-900 p-1">
          {[
            { key: "weekly", label: "Week" },
            { key: "monthly", label: "Month" },
            { key: "yearly", label: "Year" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRange(tab.key as "weekly" | "monthly" | "yearly")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                range === tab.key ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Gross Revenue</p>
          <p className="text-2xl font-bold text-white mt-2">{fmtINR(summary.grossRevenue)}</p>
        </div>
        <div className="glass-panel border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Lead Revenue</p>
          <p className="text-2xl font-bold text-brand-400 mt-2">{fmtINR(summary.leadRevenue)}</p>
        </div>
        <div className="glass-panel border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Subscriptions</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">{fmtINR(summary.subscriptionRevenue)}</p>
        </div>
        <div className="glass-panel border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Auction Fees</p>
          <p className="text-2xl font-bold text-purple-400 mt-2">{fmtINR(summary.auctionRevenue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-panel border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-brand-400" />
            Revenue Timeline
          </h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `₹${Math.round(Number(val || 0) / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }}
                  formatter={(value, key) => {
                    const safeValue = typeof value === "number" ? value : Number(value ?? 0);
                    const safeKey = key ?? "value";
                    return [safeKey === "revenue" ? fmtINR(safeValue) : safeValue, safeKey];
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2.5} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Transaction Load
          </h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12 }} />
                <Bar dataKey="transactions" radius={[6, 6, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
              <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-green-400 text-lg font-bold">{summary.successCount}</p>
              <p className="text-[10px] text-slate-500 uppercase">Success</p>
            </div>
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-center">
              <Clock3 className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-yellow-400 text-lg font-bold">{summary.pendingCount}</p>
              <p className="text-[10px] text-slate-500 uppercase">Pending</p>
            </div>
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
              <XCircle className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <p className="text-red-400 text-lg font-bold">{summary.failedCount}</p>
              <p className="text-[10px] text-slate-500 uppercase">Failed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-semibold">Recent Revenue Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Dealer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm text-slate-300">
                    {new Date(txn.created_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-300 uppercase">{txn.type}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 font-mono">{txn.dealer_id || "n/a"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] border ${
                      txn.status === "success"
                        ? "text-green-400 bg-green-500/10 border-green-500/20"
                        : txn.status === "pending"
                          ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                          : "text-red-400 bg-red-500/10 border-red-500/20"
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-white font-semibold">{fmtINR(txn.amount)}</td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">No transactions captured yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
