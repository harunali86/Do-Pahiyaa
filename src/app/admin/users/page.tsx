"use client";

import { useState } from "react";
import {
    Search,
    MoreHorizontal,
    UserPlus,
    ShieldCheck,
    ShieldAlert,
    Ban
} from "lucide-react";

export default function UsersPage() {
    const [users] = useState([
        { id: 1, name: "Rahul Verma", email: "rahul@example.com", role: "Seller", status: "Active", joined: "2 Oct 2023" },
        { id: 2, name: "Velocity Motors", email: "sales@velocity.com", role: "Dealer", status: "Active", joined: "15 Aug 2023" },
        { id: 3, name: "Amit Shah", email: "amit.s@gmail.com", role: "Buyer", status: "Suspended", joined: "12 Dec 2023" },
        { id: 4, name: "KTM Indiranagar", email: "manager@ktm-blr.com", role: "Dealer", status: "Pending", joined: "Today" },
        { id: 5, name: "Priya Singh", email: "priya.s@yahoo.com", role: "Buyer", status: "Active", joined: "5 Jan 2024" },
    ]);

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users</h1>
                    <p className="text-slate-400">Manage access and roles</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors shadow-lg">
                    <UserPlus className="h-4 w-4" /> Add User
                </button>
            </div>

            <div className="glass-panel border border-white/5 overflow-hidden">
                {/* Table Header / Filters */}
                <div className="p-4 border-b border-white/5 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-500/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                            <option>All Roles</option>
                            <option>Dealers</option>
                            <option>Sellers</option>
                            <option>Buyers</option>
                        </select>
                        <select className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                            <option>Any Status</option>
                            <option>Active</option>
                            <option>Suspended</option>
                            <option>Pending</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-900/50 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                            <th className="py-3 px-6">Name</th>
                            <th className="py-3 px-6">Role</th>
                            <th className="py-3 px-6">Status</th>
                            <th className="py-3 px-6">Joined</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border
                           ${user.role === 'Dealer' ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' :
                                            user.role === 'Seller' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                        {user.role === 'Dealer' && <ShieldCheck className="h-3 w-3" />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase
                           ${user.status === 'Active' ? 'text-green-400' :
                                            user.status === 'Suspended' ? 'text-red-400' :
                                                'text-accent-gold'}`}>
                                        {user.status === 'Suspended' && <Ban className="h-3 w-3 mr-1" />}
                                        {user.status === 'Pending' && <ShieldAlert className="h-3 w-3 mr-1" />}
                                        {user.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-400">{user.joined}</td>
                                <td className="py-4 px-6 text-right">
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-slate-400">
                    <span>Showing 5 of 142 users</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg hover:bg-white/5 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 rounded-lg hover:bg-white/5">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
