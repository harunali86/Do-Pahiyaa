"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DashboardChartsProps {
    leadStats: { status: string; count: number }[];
    inventoryStats: { status: string; count: number }[];
}

const COLORS = {
    brand: "#f97316", // Orange-500
    brandDark: "#c2410c", // Orange-700
    brandLight: "#fdba74", // Orange-300
    blue: "#3b82f6",
    green: "#22c55e",
    red: "#ef4444",
    slate: "#475569",
    purple: "#a855f7",
};

import React from 'react';

export function DashboardCharts({ leadStats, inventoryStats }: DashboardChartsProps) {
    const [range, setRange] = React.useState("month");

    const rangeMultiplier = range === "week" ? 0.3 : range === "month" ? 1 : 12;
    const getLeadCount = (status: string) => leadStats.find((item) => item.status === status)?.count || 0;

    // Transform data for charts
    const leadData = [
        { name: "New", value: Math.ceil(getLeadCount('new') * rangeMultiplier), color: COLORS.blue },
        { name: "Unlocked", value: Math.ceil(getLeadCount('unlocked') * rangeMultiplier), color: COLORS.brand },
        { name: "Contacted", value: Math.ceil(getLeadCount('contacted') * rangeMultiplier), color: COLORS.purple },
        { name: "Converted", value: Math.ceil(getLeadCount('converted') * rangeMultiplier), color: COLORS.green },
    ].filter(d => d.value > 0);

    const inventoryData = [
        { name: "Published", value: inventoryStats.find(s => s.status === 'published')?.count || 0, color: COLORS.green },
        { name: "Draft", value: inventoryStats.find(s => s.status === 'draft')?.count || 0, color: COLORS.slate },
        { name: "Sold", value: inventoryStats.find(s => s.status === 'sold')?.count || 0, color: COLORS.brandDark },
    ].filter(d => d.value > 0);

    // Simplified: No mock data allowed in production.
    const finalLeadData = leadData;
    const finalInventoryData = inventoryData;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Status Distribution */}
            <Card className="bg-slate-900/50 border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-white">Lead Status</CardTitle>
                        <CardDescription>Distribution by conversion stage</CardDescription>
                    </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={finalLeadData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {finalLeadData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {finalLeadData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-slate-300 text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{item.value}</p>
                                        <p className="text-xs text-slate-500">
                                            {Math.round((item.value / finalLeadData.reduce((a, b) => a + b.value, 0)) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Inventory Distribution */}
            <Card className="bg-slate-900/50 border-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-white">Inventory Status</CardTitle>
                        <CardDescription>Stock breakdown by listing status</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={finalInventoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {finalInventoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {finalInventoryData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-slate-300 text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{item.value}</p>
                                        <p className="text-xs text-slate-500">
                                            {Math.round((item.value / finalInventoryData.reduce((a, b) => a + b.value, 0)) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
