import AdminSidebar from "@/components/admin/Sidebar";
import { CommandMenu } from "@/components/admin/CommandMenu";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950 font-sans selection:bg-brand-500/30">
            <CommandMenu />
            <AdminSidebar />
            <div className="flex-1 w-full overflow-x-hidden min-h-screen relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
