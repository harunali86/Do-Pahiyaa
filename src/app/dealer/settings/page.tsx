import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Shield, CreditCard, Bell, Building2, ChevronRight } from "lucide-react";

export default async function DealerSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const settingsGroups = [
    {
      title: "Account & Security",
      items: [
        {
          icon: User,
          label: "Profile Information",
          description: "Update your name, phone, and avatar",
          href: "/settings/profile?tab=general"
        },
        {
          icon: Shield,
          label: "Login & Security",
          description: "Change password and manage sessions",
          href: "/settings/profile?tab=security"
        }
      ]
    },
    {
      title: "Business Settings",
      items: [
        {
          icon: Building2,
          label: "Dealership Details",
          description: "Manage shop location and business hours",
          href: "/settings/profile?tab=general", // Reusing profile for now as it has address
        },
        {
          icon: CreditCard,
          label: "Billing & Credits",
          description: "View credit history and purchase plans",
          href: "/dealer/dashboard", // Redirect to dashboard where billing is
        },
        {
          icon: Bell,
          label: "Notifications",
          description: "Configure email and SMS alerts",
          href: "#",
          disabled: true
        }
      ]
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400">Manage your dealership preferences</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {settingsGroups.map((group, i) => (
          <div key={i} className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80 px-1">{group.title}</h2>
            <div className="glass-panel border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
              {group.items.map((item, j) => (
                <Link
                  key={j}
                  href={item.disabled ? '#' : item.href}
                  className={`flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}
                >
                  <div className="p-2.5 bg-slate-800 rounded-lg text-slate-400 group-hover:text-white group-hover:bg-brand-500/20 transition-colors">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.label}</h3>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                  {!item.disabled && (
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-500 pt-8 border-t border-white/5">
        <p>Do Pahiyaa Dealer Panel v1.0.0</p>
      </div>
    </div>
  );
}
