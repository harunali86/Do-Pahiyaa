import DealerSidebar from "@/components/dealer/Sidebar";

export default function DealerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <DealerSidebar />
            <div className="flex-1 w-full overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}
