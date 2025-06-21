"use client";

import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import {
    FiFeather,
    FiBookOpen,
    FiAlertCircle,
    FiBarChart2,
} from "react-icons/fi";

export default function ExpertDashboard() {
    useAuthGuard(["expert"]);
    return (
        <div className="w-full bg-orange-50 min-h-screen">
            <div className="p-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardCard
                        icon={<FiFeather className="text-orange-500 text-xl" />}
                        title="Tư vấn kỹ thuật"
                        description="Hỗ trợ kỹ thuật cho nông dân, phản hồi các yêu cầu theo mùa vụ."
                    />
                    <DashboardCard
                        icon={<FiBookOpen className="text-orange-500 text-xl" />}
                        title="Viết bài chuyên môn"
                        description="Chia sẻ kiến thức, kỹ thuật canh tác qua các bài viết chuyên sâu."
                    />
                    <DashboardCard
                        icon={<FiAlertCircle className="text-orange-500 text-xl" />}
                        title="Phản hồi sự cố"
                        description="Xử lý các báo cáo bất thường về mùa vụ hoặc sơ chế từ nông dân."
                    />
                    <DashboardCard
                        icon={<FiBarChart2 className="text-orange-500 text-xl" />}
                        title="Đánh giá tiến độ"
                        description="Đánh giá quá trình canh tác và sơ chế theo từng mùa."
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
