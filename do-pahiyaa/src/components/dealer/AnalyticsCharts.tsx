"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AnalyticsChartsProps {
    data: { date: string; leads: number; conversions: number }[];
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
    return (
        <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
                <CardTitle className="text-white">Leads Performance History</CardTitle>
                <CardDescription>Daily lead volume and conversions over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                            />
                            <Legend />
                            <Bar dataKey="leads" name="New Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="conversions" name="Unlocked" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
