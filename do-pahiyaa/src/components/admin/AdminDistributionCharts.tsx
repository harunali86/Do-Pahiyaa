"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import React from 'react';

const COLORS = {
    buyer: "#3b82f6",
    dealer: "#f97316",
    admin: "#8b5cf6",
    published: "#22c55e",
    pending: "#eab308",
    rejected: "#ef4444",
};

interface AdminDistributionChartsProps {
    userStats: { role: string; count: number }[];
    listingStats: { status: string; count: number }[];
}

export function AdminDistributionCharts({ userStats, listingStats }: AdminDistributionChartsProps) {
    const userData = userStats.map(s => ({
        name: s.role.charAt(0).toUpperCase() + s.role.slice(1),
        value: s.count,
        color: (COLORS as any)[s.role] || "#94a3b8"
    })).filter(d => d.value > 0);

    const listingData = listingStats.map(s => ({
        name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
        value: s.count,
        color: (COLORS as any)[s.status] || "#94a3b8"
    })).filter(d => d.value > 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-none bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-white text-lg">User Ecosystem</CardTitle>
                    <CardDescription>Composition of platform users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {userData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-slate-400">{item.name}: <span className="text-white font-bold">{item.value}</span></span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card border-none bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-white text-lg">Inventory Pipeline</CardTitle>
                    <CardDescription>Breakdown by listing status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={listingData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {listingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {listingData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-slate-400">{item.name}: <span className="text-white font-bold">{item.value}</span></span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
