"use client";

import { useState } from "react";
import {
  Save,
  Power,
  Bell,
  Shield,
  Database,
  RefreshCcw,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export default function AdminSettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [flags, setFlags] = useState({
    auctions: true,
    newSignups: true,
    payments: true,
    betaFeatures: false
  });

  const toggle = (key: keyof typeof flags) => {
    setFlags(p => ({ ...p, [key]: !p[key] }));
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400">Configure global platform parameters</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Critical Controls */}
        <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" /> Danger Zone
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl">
              <div>
                <h3 className="font-bold text-white">Maintenance Mode</h3>
                <p className="text-sm text-slate-500">Disable access for all non-admin users.</p>
              </div>
              <button
                onClick={() => setMaintenance(!maintenance)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${maintenance
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
              >
                <Power className="w-4 h-4" /> {maintenance ? "Active" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl">
              <div>
                <h3 className="font-bold text-white">Cache Purge</h3>
                <p className="text-sm text-slate-500">Clear all CDN and API caches immediately.</p>
              </div>
              <button className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" /> Purge Now
              </button>
            </div>
          </div>
        </section>

        {/* Feature Flags */}
        <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" /> Feature Flags
          </h2>

          <div className="space-y-4">
            {Object.entries(flags).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-slate-300 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <button onClick={() => toggle(key as any)}>
                  {enabled
                    ? <ToggleRight className="w-8 h-8 text-brand-400 transition-colors" />
                    : <ToggleLeft className="w-8 h-8 text-slate-600 transition-colors" />
                  }
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Notification Config */}
        <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" /> Notification Broadcast
          </h2>
          <div className="flex gap-4">
            <input type="text" placeholder="Announcement Title" className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-500/50" />
            <button className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-700">Send Test</button>
          </div>
          <textarea rows={3} placeholder="Message body..." className="w-full mt-4 bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-500/50" />
          <div className="mt-4 flex justify-end">
            <button className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-500 shadow-lg shadow-brand-500/20">Broadcast to All Users</button>
          </div>
        </section>

      </div>
    </div>
  );
}
