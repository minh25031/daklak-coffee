"use client";

import { JSX, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import React from "react";
import {
    FiPieChart,
    FiUsers,
    FiFileText,
    FiSettings,
    FiBarChart2,
    FiMessageCircle,
    FiBookOpen,
    FiClipboard,
    FiFeather,
} from "react-icons/fi";

const iconMap = {
    dashboard: <FiPieChart />,
    users: <FiUsers />,
    contracts: <FiFileText />,
    reports: <FiBarChart2 />,
    settings: <FiSettings />,
    feedback: <FiMessageCircle />,
    articles: <FiBookOpen />,
    consultation: <FiFeather />,
    crops: <FiClipboard />,
};

// ===== Sidebar Layout =====
interface SidebarProps {
    children: ReactNode;
    defaultCollapsed?: boolean;
    onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ children, defaultCollapsed = false, onCollapseChange }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    const childrenWithProps = React.Children.map(children, (child) => {
        if (
            typeof child === "object" &&
            child &&
            "type" in child &&
            (child as any).type.name === "SidebarFooter"
        ) {
            return React.cloneElement(child as React.ReactElement<any>, {
                isCollapsed,
            });
        }
        return child;
    });

    return (
        <aside
            className={cn(
                "h-screen bg-white border-r shadow-sm transition-all duration-300",
                isCollapsed ? "w-[64px]" : "w-[260px]",
                "flex flex-col fixed left-0 top-0 z-50"
            )}
        >
            <div className="h-16 flex items-center justify-between px-4 border-b">
                <div className="flex items-center gap-2 overflow-hidden">
                    {!isCollapsed && (
                        <>
                            <img src="/logo_bg.png" alt="logo" className="w-7 h-7" />
                            <span className="text-xl font-bold text-orange-600 truncate">DakLakCoffee</span>
                        </>
                    )}
                </div>
                <button
                    onClick={() => {
                        const newState = !isCollapsed;
                        setIsCollapsed(newState);
                        onCollapseChange?.(newState);
                    }}
                    className="text-orange-600 hover:bg-orange-100 rounded p-1"
                >
                    <Menu size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-auto">{childrenWithProps}</div>
        </aside>
    );
}

// ===== Sidebar Header =====
export function SidebarHeader({ children }: { children?: ReactNode }) {
    return <div className="px-4 py-2 border-b font-medium text-sm">{children}</div>;
}

// ===== Sidebar Content =====
export function SidebarContent({ children }: { children: ReactNode }) {
    return <nav className="py-4 space-y-1">{children}</nav>;
}

// ===== Sidebar Group (navigation) =====
export function SidebarGroup() {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("user_role"); // slug: "admin", "expert", ...
        setRole(storedRole);
    }, []);

    const navigationItems: Record<string, { title: string; href: string; icon: JSX.Element }[]> = {
        farmer: [
            { title: "Tổng quan", href: "/dashboard/farmer", icon: iconMap.dashboard },
            { title: "Mùa vụ", href: "/dashboard/farmer/crop-seasons", icon: iconMap.crops },
            { title: "Vườn cà phê", href: "/dashboard/farmer/batches", icon: iconMap.articles },
            { title: "Tư vấn", href: "/dashboard/farmer/request-feedback", icon: iconMap.feedback },
        ],
        admin: [
            { title: "Tổng quan", href: "/dashboard/admin", icon: iconMap.dashboard },
            { title: "Quản lý người dùng", href: "/dashboard/admin/users", icon: iconMap.users },
            { title: "Hợp đồng", href: "/dashboard/admin/contracts", icon: iconMap.contracts },
            { title: "Báo cáo", href: "/dashboard/admin/reports", icon: iconMap.reports },
            { title: "Cài đặt", href: "/dashboard/admin/settings", icon: iconMap.settings },
        ],
        expert: [
            { title: "Tổng quan", href: "/dashboard/expert", icon: iconMap.dashboard },
            { title: "Tư vấn", href: "/dashboard/expert/consultations", icon: iconMap.consultation },
            { title: "Bài viết", href: "/dashboard/expert/articles", icon: iconMap.articles },
        ],
        manager: [
            { title: "Tổng quan", href: "/dashboard/manager", icon: iconMap.dashboard },
            { title: "Hợp đồng", href: "/dashboard/manager/contracts", icon: iconMap.contracts },
            { title: "Nông dân", href: "/dashboard/manager/farmers", icon: iconMap.users },
            { title: "Báo cáo", href: "/dashboard/manager/reports", icon: iconMap.reports },
        ],
    };

    if (!role || !navigationItems[role]) {
        return <div className="px-4 text-gray-400 text-sm">Đang tải menu...</div>;
    }

    return (
        <div className="space-y-1 px-2">
            {navigationItems[role].map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive
                                ? "bg-orange-100 text-orange-700"
                                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        )}
                    >
                        <span className="shrink-0 w-5 text-center">{item.icon}</span>
                        <span className="truncate">{item.title}</span>
                    </Link>
                );
            })}
        </div>
    );
}

// ===== Sidebar Footer =====
interface SidebarFooterProps {
    role?: string | null;
    isCollapsed?: boolean;
}

export function SidebarFooter({ role, isCollapsed }: SidebarFooterProps) {
    const [currentRole, setCurrentRole] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("user_role_raw"); // e.g., "AgriculturalExpert"
        setCurrentRole(storedRole);
    }, []);

    if (isCollapsed) return null;

    return (
        <div className="border-t px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
            <span className="text-gray-400">Đăng nhập:</span>
            <span className="font-medium text-orange-600">{currentRole ?? "Ẩn danh"}</span>
        </div>
    );
}
