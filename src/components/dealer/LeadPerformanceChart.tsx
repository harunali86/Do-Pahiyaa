"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from 'date-fns';

import React from 'react';



export function LeadPerformanceChart() {
    const [range, setRange] = React.useState("week");

    const [mounted, setMounted] = React.useState(false);
    const [data, setData] = React.useState<any[]>([]);

    React.useEffect(() => {
        setMounted(true);
        const days = range === "week" ? 7 : range === "month" ? 30 : 12;
        const newData = Array.from({ length: days }).map((_, i) => {
            const d = new Date();
            if (range === "year") {
                d.setMonth(d.getMonth() - (11 - i));
                return {
                    date: format(d, 'MMM'),
                    leads: Math.floor(Math.random() * 50) + 20,
                    views: Math.floor(Math.random() * 200) + 100,
                };
            }
            d.setDate(d.getDate() - (range === "week" ? (6 - i) : (29 - i)));
            return {
                date: format(d, 'MMM dd'),
                leads: Math.floor(Math.random() * (range === "week" ? 15 : 10)) + 5,
                views: Math.floor(Math.random() * 50) + 20,
            };
        });
        setData(newData);
    }, [range]);

    if (!mounted) return <div className="h-[300px] w-full animate-pulse bg-slate-900/50 rounded-xl" />;

    return (
        <Card className="glass-card border-none bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-white">Lead Performance</CardTitle>
                <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/5">
                    {['week', 'month', 'year'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${range === r
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorLeads)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4 flex flex-col justify-center">
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-blue-400 font-medium mb-1">Total Leads</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-white">
                                    {data.reduce((acc, curr) => acc + curr.leads, 0)}
                                </span>
                                <span className="text-xs text-blue-400 mb-1">+12%</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                            <p className="text-sm text-slate-400 font-medium mb-1">Total Views</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-white">
                                    {data.reduce((acc, curr) => acc + curr.views, 0)}
                                </span>
                                <span className="text-xs text-slate-500 mb-1">+5%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
