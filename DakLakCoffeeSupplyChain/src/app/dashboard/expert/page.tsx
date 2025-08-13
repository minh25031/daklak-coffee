"use client";

import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { useRouter } from "next/navigation";
import {
    FiFeather,
    FiBookOpen,
    FiAlertCircle,
    FiBarChart2,
    FiCheckSquare,
} from "react-icons/fi";

export default function ExpertDashboard() {
    useAuthGuard(["expert"]);
    const router = useRouter();

    return (
        <div className="w-full bg-orange-50 min-h-screen">
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DashboardCard
                        icon={<FiFeather className="text-orange-500 text-xl" />}
                        title="Tư vấn kỹ thuật"
                        description="Hỗ trợ kỹ thuật cho nông dân, phản hồi các yêu cầu theo mùa vụ."
                        onClick={() => router.push("/dashboard/expert/anomalies")}
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
                        onClick={() => router.push("/dashboard/expert/anomalies")}
                    />
                    <DashboardCard
                        icon={<FiBarChart2 className="text-orange-500 text-xl" />}
                        title="Đánh giá tiến độ"
                        description="Đánh giá quá trình canh tác và sơ chế theo từng mùa."
                    />
                    <DashboardCard
                        icon={<FiCheckSquare className="text-green-500 text-xl" />}
                        title="Đánh giá lô sơ chế"
                        description="Đánh giá chất lượng và tiến độ sơ chế cà phê từ nông dân."
                        onClick={() => router.push("/dashboard/expert/anomalies")}
                        highlight={true}
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
    onClick,
    highlight = false,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    highlight?: boolean;
}) {
    const baseClasses = "p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer";
    const highlightClasses = highlight ? "border-2 border-green-200 bg-green-50" : "";
    const clickableClasses = onClick ? "hover:bg-orange-50 hover:border-orange-200" : "";

    return (
        <div 
            className={`${baseClasses} ${highlightClasses} ${clickableClasses}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <p className="text-gray-500 text-sm">{description}</p>
            {onClick && (
                <div className="mt-3 text-xs text-orange-600 font-medium">
                    Nhấn để xem chi tiết →
                </div>
            )}
        </div>
    );
}
