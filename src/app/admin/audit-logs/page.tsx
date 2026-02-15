"use client";

import { Clock, Search, Filter } from "lucide-react";

const logs = [
    { id: 1, action: "User Login", user: "Vikram S.", role: "Dealer", ip: "192.168.1.1", time: "2 mins ago", status: "Success" },
    { id: 2, action: "Delete Listing", user: "Admin", role: "Super Admin", ip: "10.0.0.5", time: "15 mins ago", status: "Success" },
    { id: 3, action: "Failed Payment", user: "Rohan M.", role: "Buyer", ip: "192.168.1.42", time: "1 hour ago", status: "Failed" },
    { id: 4, action: "Update Profile", user: "KTM Indiranagar", role: "Dealer", ip: "8.8.8.8", time: "2 hours ago", status: "Success" },
    { id: 5, action: "Bid Placed", user: "Amit K.", role: "User", ip: "1.1.1.1", time: "3 hours ago", status: "Success" },
];

export default function AuditLogsPage() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
                    <p className="text-slate-400">Track all system activities and security events</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="Search logs..." className="bg-slate-900 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50" />
                    </div>
                    <button className="bg-slate-900 border border-white/10 p-2 rounded-lg text-slate-400 hover:text-white">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/50 text-slate-500 font-medium">
                        <tr>
                            <th className="p-4">Action</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Time</th>
                            <th className="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors font-mono">
                                <td className="p-4 font-bold text-white">{log.action}</td>
                                <td className="p-4">{log.user}</td>
                                <td className="p-4 text-xs uppercase tracking-wider text-slate-500">{log.role}</td>
                                <td className="p-4 text-slate-500">{log.ip}</td>
                                <td className="p-4 flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-slate-600" /> {log.time}
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${log.status === 'Success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
