"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { FiBell, FiMail, FiSmile } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { roleRawToDisplayName } from "@/lib/constrant/role";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, User } from "lucide-react";

// Map path segment to page title
const pathTitleMap: Record<string, string> = {
    dashboard: "Tổng quan",
    farmer: "Tổng quan",
    admin: "Tổng quan",
    manager: "Tổng quan",
    "crop-seasons": "Mùa vụ",
    batches: "Danh sách lô sơ chế",
    evaluations: "Đánh giá lô sơ chế",
    progresses: "Tiến trình lô sơ chế",
    wastes: "Chất thải lô sơ chế",
    "processing-methods": "Phương pháp sơ chế",
    parameters: "Tham số sơ chế",
    stages: "Công đoạn sơ chế",
    "waste-disposals": "Xử lý chất thải",
    "request-feedback": "Tư vấn kỹ thuật",
    consultations: "Tư vấn",
    articles: "Bài viết",
    contracts: "Hợp đồng",
    reports: "Báo cáo",
    users: "Quản lý người dùng",
    settings: "Cài đặt",
};

export default function HeaderDashboard() {
    const pathname = usePathname();
    const router = useRouter();

    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);

    useEffect(() => {
        setUserName(localStorage.getItem("user_name"));
        setUserRole(localStorage.getItem("user_role_raw"));
        setAvatar(localStorage.getItem("user_avatar"));
    }, []);

    const currentTitle = useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);
        const last = segments[segments.length - 1];
        return pathTitleMap[last] || "Tổng quan";
    }, [pathname]);

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userName ?? "U"
    )}&background=FD7622&color=fff`;

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

            {/* Icons + Avatar + Dropdown */}
            <div className="flex items-center gap-4">
                <IconWithBadge icon={<FiBell size={20} />} count={23} />
                <IconWithBadge icon={<FiMail size={20} />} count={68} />
                <IconWithBadge icon={<FiSmile size={20} />} count={14} />

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-700">
                                    {userName ?? "Ẩn danh"}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {roleRawToDisplayName[userRole ?? ""] ??
                                        "Vai trò không xác định"}
                                </p>
                            </div>
                            <img
                                src={avatar || fallbackAvatar}
                                alt="avatar"
                                className="w-9 h-9 rounded-full border border-gray-300 object-cover"
                            />
                        </div>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="min-w-[180px] bg-white rounded-md shadow-lg p-1 border text-sm z-[100]"
                            sideOffset={8}
                        >
                            <DropdownMenu.Item
                                className="px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 cursor-pointer"
                                onClick={() => router.push("/dashboard/profile")}
                            >
                                <User size={16} /> Hồ sơ cá nhân
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

                            <DropdownMenu.Item
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded flex items-center gap-2 cursor-pointer"
                                onClick={() => {
                                    localStorage.clear();
                                    router.push("/auth/login");
                                }}
                            >
                                <LogOut size={16} /> Đăng xuất
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </div>
    );
}

function IconWithBadge({
    icon,
    count,
}: {
    icon: React.ReactNode;
    count: number;
}) {
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
