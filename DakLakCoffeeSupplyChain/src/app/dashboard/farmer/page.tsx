"use client";

import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { useEffect, useState } from "react";
import {
    FiClipboard,
    FiFeather,
    FiBookOpen,
    FiPackage,
    FiAlertTriangle,
} from "react-icons/fi";
import Link from "next/link";

// 🔥 Chart.js setup
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getCropSeasonsForCurrentUser } from "@/lib/api/cropSeasons";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function FarmerDashboard() {
    useAuthGuard(["farmer"]);

    const [stats, setStats] = useState<{
        activeSeasons: number;
        upcomingHarvests: number;
        pendingWarehouseRequests: number;
        unreadAdvice: number;
    } | null>(null);

    const [alerts, setAlerts] = useState<string[]>([]);

    const [chartData, setChartData] = useState<any>(null);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            tooltip: {
                mode: "index" as const,
                intersect: false,
            },
        },
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const cropSeasons = await getCropSeasonsForCurrentUser({
                    status: "Đang hoạt động",
                    page: 1,
                    pageSize: 100,
                });

                const activeCount = cropSeasons.length;


                setStats({
                    activeSeasons: activeCount,
                    upcomingHarvests: 5, // tạm giả lập
                    pendingWarehouseRequests: 1,
                    unreadAdvice: 3,
                });

                setAlerts([
                    "Chưa cập nhật tiến độ trong 7 ngày qua.",
                    "Vùng Cư M'gar có sản lượng thấp hơn kế hoạch.",
                ]);

                setChartData({
                    labels: ["T1", "T2", "T3", "T4", "T5"],
                    datasets: [
                        {
                            label: "Thực tế (kg)",
                            data: [400, 450, 380, 520, 610],
                            borderColor: "#FD7622",
                            backgroundColor: "rgba(253, 118, 34, 0.2)",
                            tension: 0.3,
                            fill: false,
                        },
                        {
                            label: "Kế hoạch (kg)",
                            data: [500, 500, 500, 500, 500],
                            borderColor: "#8884d8",
                            borderDash: [5, 5],
                            backgroundColor: "rgba(136, 132, 216, 0.2)",
                            tension: 0.3,
                            fill: false,
                        },
                    ],
                });
            } catch (error) {
                console.error("Lỗi lấy dữ liệu dashboard:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="w-full bg-orange-50 min-h-screen">
            <div className="p-6 space-y-10">

                {/* 📊 Summary Cards */}
                {stats && (
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard icon={<FiClipboard />} label="Mùa vụ đang hoạt động" value={stats.activeSeasons} />
                            <StatCard icon={<FiBookOpen />} label="Vùng sắp thu hoạch" value={stats.upcomingHarvests} />
                            <StatCard icon={<FiPackage />} label="Yêu cầu nhập kho" value={stats.pendingWarehouseRequests} />
                            <StatCard icon={<FiFeather />} label="Phản hồi kỹ thuật chưa đọc" value={stats.unreadAdvice} />
                        </div>
                    </section>
                )}

                {/* 📈 Biểu đồ Chart.js */}
                {chartData && (
                    <section>
                        <DashboardSectionTitle title="Sản lượng theo tháng" />
                        <div className="bg-white rounded-xl shadow p-4 w-[50%] ">
                            <div className="relative h-[250px] w-full">
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        </div>


                    </section>
                )}

                {/* 🚨 Cảnh báo */}
                {alerts.length > 0 && (
                    <section>
                        <DashboardSectionTitle title="Cảnh báo" />
                        <div className="space-y-4">
                            {alerts.map((msg, idx) => (
                                <AlertCard key={idx} message={msg} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 🚀 Hành động nhanh */}
                <section>
                    <DashboardSectionTitle title="Hành động nhanh" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ActionCard
                            icon={<FiClipboard className="text-orange-500 text-xl" />}
                            title="Quản lý mùa vụ"
                            description="Theo dõi và cập nhật thông tin mùa vụ canh tác."
                            href="/dashboard/farmer/crop-seasons"
                        />
                        <ActionCard
                            icon={<FiPackage className="text-orange-500 text-xl" />}
                            title="Gửi yêu cầu nhập kho"
                            description="Tạo yêu cầu nhập hàng từ nông trại vào kho."
                            href="/dashboard/farmer/warehouse-request"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

// 🧩 Subcomponents

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className="text-orange-500 text-2xl">{icon}</div>
            <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-gray-600 text-sm">{label}</p>
            </div>
        </div>
    );
}

function AlertCard({ message }: { message: string }) {
    return (
        <div className="bg-red-100 text-red-800 border border-red-300 rounded-lg p-4 flex items-start gap-3">
            <FiAlertTriangle className="text-xl mt-1" />
            <div>{message}</div>
        </div>
    );
}

function ActionCard({
    icon,
    title,
    description,
    href,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <Link href={href} className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition block">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <p className="text-gray-500 text-sm">{description}</p>
        </Link>
    );
}

function DashboardSectionTitle({ title }: { title: string }) {
    return (
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    );
}
