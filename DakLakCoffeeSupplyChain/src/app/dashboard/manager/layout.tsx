"use client";

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("user_role");
        setRole(storedRole);
    }, []);

    return (
        <div className="min-h-screen w-full bg-[#fefaf4]">
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup />
                </SidebarContent>
                <SidebarFooter role={role} />
            </Sidebar>

            <main className="ml-64 p-6">{children}</main>
        </div>
    );
}
