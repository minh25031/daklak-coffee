"use client";

import { FiFileText, FiUsers, FiBarChart2 } from "react-icons/fi";

export default function ManagerDashboard() {
    return (
        <div className="w-full bg-orange-50 min-h-screen">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-orange-600 mb-6">
                    🧑‍💼 Manager Dashboard
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardCard
                        icon={<FiFileText className="text-orange-500 text-xl" />}
                        title="Hợp đồng"
                        description="Quản lý các hợp đồng thu mua, giao hàng, thanh toán."
                    />
                    <DashboardCard
                        icon={<FiUsers className="text-orange-500 text-xl" />}
                        title="Danh sách nông dân"
                        description="Theo dõi và quản lý các hộ nông dân hợp tác."
                    />
                    <DashboardCard
                        icon={<FiBarChart2 className="text-orange-500 text-xl" />}
                        title="Báo cáo"
                        description="Xem thống kê về sản lượng, tiến độ, và chất lượng."
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
