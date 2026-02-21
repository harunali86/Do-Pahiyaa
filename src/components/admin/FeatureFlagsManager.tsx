"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Power, Save } from "lucide-react";
import { toast } from "sonner";

type ConfigItem = {
  key: string;
  value: string;
  label: string;
  category: string;
  description?: string | null;
};

interface FeatureFlagsManagerProps {
  initialConfigs: ConfigItem[];
}

export function FeatureFlagsManager({ initialConfigs }: FeatureFlagsManagerProps) {
  const [configs, setConfigs] = useState<ConfigItem[]>(initialConfigs);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConfigs(initialConfigs);
  }, [initialConfigs]);

  const visibleItems = useMemo(
    () => configs.filter((item) => item.category === "features" || item.category === "system"),
    [configs]
  );

  const hasChanges = Object.keys(edited).length > 0;

  const getValue = (key: string, fallback: string) => edited[key] ?? fallback;

  const toggleKey = (item: ConfigItem) => {
    const current = getValue(item.key, item.value);
    const nextValue = current === "true" ? "false" : "true";
    setEdited((prev) => ({ ...prev, [item.key]: nextValue }));
  };

  const saveChanges = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const updates = Object.entries(edited).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json?.error?.message || "Failed to save feature flags");
      }

      setConfigs((prev) =>
        prev.map((cfg) => (
          edited[cfg.key] !== undefined ? { ...cfg, value: edited[cfg.key] } : cfg
        ))
      );
      setEdited({});
      toast.success("Feature flags updated");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Feature Flags</h1>
          <p className="text-slate-400">Enable/disable platform capabilities without redeploy.</p>
        </div>
        <button
          onClick={saveChanges}
          disabled={!hasChanges || saving}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            hasChanges
              ? "bg-brand-600 text-white hover:bg-brand-500"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : hasChanges ? `Save ${Object.keys(edited).length} Change(s)` : "No Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleItems.map((item) => {
          const isEnabled = getValue(item.key, item.value) === "true";
          return (
            <div key={item.key} className="glass-panel border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-white font-semibold">{item.label}</p>
                  <p className="text-xs text-slate-500 font-mono">{item.key}</p>
                </div>
                <button
                  onClick={() => toggleKey(item)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    isEnabled
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-slate-900 border-white/10 text-slate-400"
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {isEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              {item.description && (
                <p className="text-sm text-slate-400">{item.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
