"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import {
  Save,
  Power,
  Bell,
  Shield,
  Database,
  RefreshCcw,
  ToggleLeft,
  ToggleRight,
  IndianRupee,
  Loader2,
  Check
} from "lucide-react";
import { toast } from "sonner";

type ConfigItem = {
  key: string;
  value: string;
  label: string;
  category: string;
  description: string | null;
};

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/config");
      const json = await res.json();
      if (json.success) {
        setConfigs(json.data);
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const updateValue = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const hasChanges = Object.keys(editedValues).length > 0;

  const saveChanges = async () => {
    if (!hasChanges) return;
    setSaving(true);

    try {
      const updates = Object.entries(editedValues).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/v1/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`${updates.length} setting(s) saved!`);
        setEditedValues({});
        fetchConfigs();
      } else {
        toast.error(json.error?.message || "Save failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const getValue = (key: string) => editedValues[key] ?? configs.find(c => c.key === key)?.value ?? "";
  const isEdited = (key: string) => key in editedValues;

  const pricingConfigs = configs.filter(c => c.category === "pricing");
  const featureConfigs = configs.filter(c => c.category === "features");
  const systemConfigs = configs.filter(c => c.category === "system");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400">Configure pricing, features, and platform behaviour</p>
        </div>
        <button
          onClick={saveChanges}
          disabled={!hasChanges || saving}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${hasChanges
            ? "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20"
            : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : hasChanges ? `Save ${Object.keys(editedValues).length} Change(s)` : "All Saved"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Pricing Engine */}
        <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-accent-gold" /> Pricing Engine
          </h2>
          <p className="text-xs text-slate-500 mb-6">All marketplace prices. Changes apply instantly.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingConfigs.map((config) => (
              <div
                key={config.key}
                className={`p-4 bg-slate-950/50 border rounded-xl transition-all ${isEdited(config.key) ? "border-brand-500/50 ring-1 ring-brand-500/20" : "border-white/5"
                  }`}
              >
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {config.label}
                </label>
                <input
                  type="text"
                  value={getValue(config.key)}
                  onChange={(e) => updateValue(config.key, e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                {config.description && (
                  <p className="text-xs text-slate-600 mt-2">{config.description}</p>
                )}
                {isEdited(config.key) && (
                  <p className="text-xs text-brand-400 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Modified
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Feature Flags */}
        <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" /> Feature Flags
          </h2>

          <div className="space-y-4">
            {featureConfigs.map((config) => {
              const isEnabled = getValue(config.key) === "true";
              return (
                <div key={config.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div>
                    <span className="text-slate-300 font-medium">{config.label}</span>
                    {isEdited(config.key) && <span className="ml-2 text-xs text-brand-400">Modified</span>}
                  </div>
                  <button onClick={() => updateValue(config.key, isEnabled ? "false" : "true")}>
                    {isEnabled
                      ? <ToggleRight className="w-8 h-8 text-brand-400 transition-colors" />
                      : <ToggleLeft className="w-8 h-8 text-slate-600 transition-colors" />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* System Controls */}
        <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" /> System Controls
          </h2>

          <div className="space-y-4">
            {systemConfigs.map((config) => {
              const isEnabled = getValue(config.key) === "true";
              return (
                <div key={config.key} className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-xl">
                  <div>
                    <h3 className="font-bold text-white">{config.label}</h3>
                    <p className="text-sm text-slate-500">{config.description}</p>
                  </div>
                  <button
                    onClick={() => updateValue(config.key, isEnabled ? "false" : "true")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${isEnabled
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                  >
                    <Power className="w-4 h-4" /> {isEnabled ? "Active" : "Disabled"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Notification Broadcast */}
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
