"use client";

import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { FiClipboard, FiFeather, FiBookOpen } from "react-icons/fi";

export default function FarmerDashboard() {
    useAuthGuard(["farmer"]);
    return (
        <div className="w-full bg-orange-50 min-h-screen">
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardCard
                        icon={<FiClipboard className="text-orange-500 text-xl" />}
                        title="Mùa vụ"
                        description="Theo dõi và quản lý mùa vụ canh tác của bạn."
                    />
                    <DashboardCard
                        icon={<FiBookOpen className="text-orange-500 text-xl" />}
                        title="Vườn cà phê"
                        description="Thông tin chi tiết về các lô vườn bạn đang sở hữu."
                    />
                    <DashboardCard
                        icon={<FiFeather className="text-orange-500 text-xl" />}
                        title="Tư vấn kỹ thuật"
                        description="Gửi yêu cầu và nhận phản hồi từ chuyên gia."
                    />
                </div>
            </div>
        </div>
    );
}

function DashboardCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <p className="text-gray-500 text-sm">{description}</p>
        </div>
    );
}
