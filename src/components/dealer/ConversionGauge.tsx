"use client";

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    {
        name: 'Conversion',
        uv: 76,  // Mock percentage
        fill: '#8b5cf6',
    },
];

const style = {
    top: '50%',
    right: 0,
    transform: 'translate(0, -50%)',
    lineHeight: '24px',
};

export function ConversionGauge() {
    return (
        <Card className="glass-card border-none bg-slate-900/50">
            <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Lead Conversion</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" barSize={10} data={data}>
                            <RadialBar
                                background
                                dataKey="uv"
                                cornerRadius={30}
                                fill="#8b5cf6"
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <span className="text-3xl font-bold text-white">76%</span>
                        <p className="text-xs text-slate-400">Success Rate</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
