"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { FiBell, FiMail, FiSmile } from "react-icons/fi";
import { Input } from "@/components/ui/input";

// Map path segment to page title
const pathTitleMap: Record<string, string> = {
    dashboard: "Tổng quan",
    farmer: "Tổng quan",
    admin: "Tổng quan",
    manager: "Tổng quan",
    "crop-seasons": "Mùa vụ",
    batches: "Vườn cà phê",
    "request-feedback": "Tư vấn kỹ thuật",
    consultations: "Tư vấn",
    articles: "Bài viết",
    contracts: "Hợp đồng",
    reports: "Báo cáo",
    users: "Người dùng",
    settings: "Cài đặt",
};


export default function HeaderDashboard() {
    const pathname = usePathname();

    const currentTitle = useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);
        const last = segments[segments.length - 1];
        return pathTitleMap[last] || "Tổng quan";
    }, [pathname]);

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800">{currentTitle}</h1>

            {/* Search */}
            <div className="relative w-full max-w-md mx-4">
                <Input
                    type="text"
                    placeholder="Search here..."
                    className="pl-4 pr-10 py-2 text-sm bg-gray-100 rounded-md focus:ring-2 focus:ring-orange-400"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <FiBell className="w-5 h-5" />
                </span>
            </div>

            {/* Icons + Avatar */}
            <div className="flex items-center gap-4">
                <IconWithBadge icon={<FiBell size={20} />} count={23} />
                <IconWithBadge icon={<FiMail size={20} />} count={68} />
                <IconWithBadge icon={<FiSmile size={20} />} count={14} />
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">Designluch</p>
                        <p className="text-xs text-gray-400">Super Admin</p>
                    </div>
                    <img
                        src="https://i.pravatar.cc/40"
                        alt="avatar"
                        className="w-9 h-9 rounded-full border border-gray-300"
                    />
                </div>
            </div>
        </div>
    );
}

function IconWithBadge({ icon, count }: { icon: React.ReactNode; count: number }) {
    return (
        <div className="relative text-gray-500 hover:text-orange-600 cursor-pointer">
            {icon}
            {count > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {count}
                </span>
            )}
        </div>
    );
}
