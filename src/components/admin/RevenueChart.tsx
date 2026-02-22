"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
    { name: "Mon", value: 4000 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 5000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 6890 },
    { name: "Sat", value: 8390 },
    { name: "Sun", value: 10490 },
];

const revenueStroke = "#14b8a6";

export function RevenueChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={revenueStroke} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={revenueStroke} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", color: "#fff" }}
                    itemStyle={{ color: revenueStroke }}
                />
                <Area type="monotone" dataKey="value" stroke={revenueStroke} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
