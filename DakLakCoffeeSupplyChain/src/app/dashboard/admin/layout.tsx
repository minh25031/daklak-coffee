"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // const [role, setRole] = useState<string | null>(null);

  // useEffect(() => {
  //   const storedRole = localStorage.getItem("user_role");
  //   setRole(storedRole);
  // }, []);

  const role = "admin";

  return (
    <div className="min-h-screen w-full bg-[#fefaf4] overflow-x-hidden">
      <Sidebar defaultCollapsed={isCollapsed} onCollapseChange={setIsCollapsed}>
        <SidebarContent>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter role={role} />
      </Sidebar>

      <main
        className={`transition-all duration-300 p-6 ${isCollapsed ? "ml-[64px]" : "ml-[260px]"
          }`}
      >
        {children}
      </main>
    </div>
  );
}
