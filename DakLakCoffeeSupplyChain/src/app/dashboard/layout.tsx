'use client';

import HeaderDashboard from '@/components/layout/HeaderDashboard';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role_raw');
    setRole(storedRole);
  }, []);

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#fefaf4]">
      {/* Sidebar */}
      <Sidebar defaultCollapsed={isCollapsed} onCollapseChange={setIsCollapsed}>
        <SidebarContent>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter role={role} />
      </Sidebar>

      {/* Content area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[64px]' : 'ml-[260px]'}`}
      >
        <HeaderDashboard />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
