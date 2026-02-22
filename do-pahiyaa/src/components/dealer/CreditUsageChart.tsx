"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    { name: 'Mon', spent: 400, bought: 2400 },
    { name: 'Tue', spent: 300, bought: 1398 },
    { name: 'Wed', spent: 200, bought: 0 },
    { name: 'Thu', spent: 278, bought: 3908 },
    { name: 'Fri', spent: 189, bought: 4800 },
    { name: 'Sat', spent: 239, bought: 3800 },
    { name: 'Sun', spent: 349, bought: 4300 },
];

export function CreditUsageChart() {
    return (
        <Card className="glass-card border-none bg-slate-900/50">
            <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Credit Usage</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Bar dataKey="spent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="bought" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
