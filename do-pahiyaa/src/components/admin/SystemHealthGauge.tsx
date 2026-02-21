"use client";

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    {
        name: 'Health',
        uv: 98,
        fill: '#10b981',
    },
];

export function SystemHealthGauge() {
    return (
        <Card className="glass-card border-none bg-slate-900/50 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-white">System Health</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={data} startAngle={180} endAngle={0}>
                            <RadialBar
                                background
                                dataKey="uv"
                                cornerRadius={30}
                                fill="#10b981"
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] text-center">
                        <span className="text-4xl font-bold text-white">98%</span>
                        <p className="text-xs text-green-400 mt-1">Operational</p>
                    </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-[-20px] px-4">
                    <span>Database</span>
                    <span>API</span>
                    <span>Storage</span>
                </div>
            </CardContent>
        </Card>
    );
}
