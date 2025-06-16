"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import React from "react";

// ===== Sidebar Layout =====
interface SidebarProps {
    children: ReactNode;
    defaultCollapsed?: boolean;
}

export function Sidebar({ children, defaultCollapsed = false }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    // Truyền prop `isCollapsed` xuống SidebarFooter
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
                    onClick={() => setIsCollapsed(!isCollapsed)}
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
    const [role, setRole] = useState<"admin" | "expert" | "manager" | "farmer" | null>(null);


    // useEffect(() => {
    //     const storedRole = localStorage.getItem("user_role");
    //     if (
    //         storedRole === "admin" ||
    //         storedRole === "expert" ||
    //         storedRole === "manager" ||
    //         storedRole === "farmer"
    //     ) {
    //         setRole(storedRole);
    //     }
    // }, []);
    useEffect(() => {
        // Gán cứng để test, bạn có thể thay bằng localStorage nếu đã có login
        localStorage.setItem("user_role", "admin"); // test
        setRole("admin");
    }, []);

    if (!role) {
        return <div className="px-4 text-gray-400 text-sm">Đang tải menu...</div>;
    }

    const navigationItems = {
        farmer: [
            { title: "Tổng quan", href: "/dashboard/farmer", icon: "🌱" },
            { title: "Mùa vụ", href: "/dashboard/farmer/crop-seasons", icon: "🌾" },
            { title: "Vườn cà phê", href: "/dashboard/farmer/batches", icon: "🌳" },
            { title: "Tư vấn", href: "/dashboard/farmer/request-feedback", icon: "💬" },
        ],
        admin: [
            { title: "Tổng quan", href: "/dashboard/admin", icon: "📊" },
            { title: "Người dùng", href: "/dashboard/admin/users", icon: "👤" },
            { title: "Hợp đồng", href: "/dashboard/admin/contracts", icon: "📄" },
            { title: "Báo cáo", href: "/dashboard/admin/reports", icon: "📈" },
            { title: "Cài đặt", href: "/dashboard/admin/settings", icon: "⚙️" },
        ],
        expert: [
            { title: "Tổng quan", href: "/dashboard/expert", icon: "📋" },
            { title: "Tư vấn", href: "/dashboard/expert/consultations", icon: "💡" },
            { title: "Bài viết", href: "/dashboard/expert/articles", icon: "📝" },
        ],
        manager: [
            { title: "Tổng quan", href: "/dashboard/manager", icon: "📊" },
            { title: "Hợp đồng", href: "/dashboard/manager/contracts", icon: "📄" },
            { title: "Nông dân", href: "/dashboard/manager/farmers", icon: "🌾" },
            { title: "Báo cáo", href: "/dashboard/manager/reports", icon: "📈" },
        ],
    };

    const items = navigationItems[role];

    return (
        <div className="space-y-1 px-2">
            {items.map((item) => {
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
    if (isCollapsed) return null;

    return (
        <div className="border-t px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
            <span className="text-gray-400">Đăng nhập:</span>
            <span className="font-medium capitalize text-orange-600">{role ?? "Ẩn danh"}</span>
        </div>
    );
}
