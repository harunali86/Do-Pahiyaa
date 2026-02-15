"use client";

import { useState } from "react";
import {
    Camera,
    MapPin,
    Phone,
    Mail,
    Save,
    UserPlus,
    Trash2,
    Clock
} from "lucide-react";
import Image from "next/image";

export default function DealerProfilePage() {
    const [members, setMembers] = useState([
        { id: 1, name: "Rahul S.", role: "Sales Manager", email: "rahul@dealership.com" },
        { id: 2, name: "Amit K.", role: "Mechanic", email: "amit@dealership.com" }
    ]);

    return (
        <div className="min-h-screen py-8 space-y-8 max-w-5xl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dealership Profile</h1>
                    <p className="text-slate-400">Manage your showroom details and team</p>
                </div>
                <button className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                </button>
            </div>

            {/* Banner & Logo */}
            <div className="relative h-48 rounded-2xl overflow-hidden group border border-white/10">
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-500">
                    <Camera className="w-8 h-8 opacity-50" />
                </div>
                <Image
                    src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2940&auto=format&fit=crop"
                    alt="Cover"
                    fill
                    className="object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/10">Change Cover</button>
                </div>

                <div className="absolute -bottom-12 left-8">
                    <div className="relative w-24 h-24 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden group/logo">
                        <Image
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop"
                            alt="Logo"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-4"></div> {/* Spacer for logo overlap */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Showroom Details */}
                <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-white text-lg border-b border-white/5 pb-4 mb-4">Showroom Info</h3>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Dealership Name</label>
                        <input type="text" defaultValue="Vikram Premium Motors" className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                <input type="text" defaultValue="+91 99887 76655" className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-500/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                <input type="text" defaultValue="sales@vikrammotors.com" className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-500/50" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <textarea rows={3} defaultValue="123, 100ft Road, Indiranagar, Bangalore - 560038" className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-500/50" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Business Hours</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input type="text" defaultValue="Mon - Sat: 10:00 AM - 8:00 PM" className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-500/50" />
                        </div>
                    </div>
                </section>

                {/* Team Management */}
                <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                        <h3 className="font-bold text-white text-lg">Team Members</h3>
                        <button className="text-brand-400 text-sm font-bold flex items-center gap-1 hover:text-brand-300">
                            <UserPlus className="w-4 h-4" /> Add
                        </button>
                    </div>
                    <div className="space-y-3">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center justify-between bg-slate-950 border border-white/5 p-3 rounded-xl group hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold uppercase text-sm">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{member.name}</p>
                                        <p className="text-slate-500 text-xs">{member.role}</p>
                                    </div>
                                </div>
                                <button className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {members.length === 0 && <p className="text-slate-500 text-sm italic">No team members added yet.</p>}
                    </div>

                    <div className="mt-8 p-4 bg-brand-500/5 border border-brand-500/10 rounded-xl text-xs text-brand-300">
                        <p><strong>Note:</strong> Team members will receive an invite email to set their password. They will have limited access based on the assigned role.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
