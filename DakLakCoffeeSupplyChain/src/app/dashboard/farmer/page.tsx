"use client";

import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { useEffect, useState } from "react";
import {
    FiClipboard,
    FiFeather,
    FiBookOpen,
    FiPackage,
    FiAlertTriangle,
    FiTrendingUp,
    FiCoffee,
} from "react-icons/fi";
import Link from "next/link";

import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { getCropSeasonsForCurrentUser } from "@/lib/api/cropSeasons";
import { getAllCropProgresses, CropProgress } from "@/lib/api/cropProgress";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
);

// Types for chart data
interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        tension?: number;
        fill?: boolean;
        borderDash?: number[];
    }[];
}

interface DoughnutData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        borderWidth: number;
    }[];
}

// Default data for when no progress exists
const DEFAULT_PROGRESS_DATA: DoughnutData = {
    labels: ["Hoàn thành", "Còn lại"],
    datasets: [
        {
            data: [0, 100],
            backgroundColor: ["#16a34a", "#f3f4f6"],
            borderWidth: 1,
        },
    ],
};

export default function FarmerDashboard() {
    useAuthGuard(["farmer"]);

    const [stats, setStats] = useState<{
        activeSeasons: number;
        upcomingHarvests: number;
        pendingWarehouseRequests: number;
        unreadAdvice: number;
    } | null>(null);

    const [alerts, setAlerts] = useState<string[]>([]);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [overallProgressData, setOverallProgressData] = useState<DoughnutData>(DEFAULT_PROGRESS_DATA);
    const [loading, setLoading] = useState(true);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" as const },
            tooltip: { mode: "index" as const, intersect: false },
        },
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch crop seasons
                const cropSeasons = await getCropSeasonsForCurrentUser({
                    status: "Đang hoạt động",
                    page: 1,
                    pageSize: 100,
                });

                setStats({
                    activeSeasons: cropSeasons.length,
                    upcomingHarvests: 5,
                    pendingWarehouseRequests: 1,
                    unreadAdvice: 3,
                });

                setAlerts([
                    "Chưa cập nhật tiến độ trong 7 ngày qua.",
                    "Vùng Cư M'gar có sản lượng thấp hơn kế hoạch.",
                ]);

                // Set monthly production chart
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

                // Handle crop progress data with error catching
                try {
                    const progresses = await getAllCropProgresses();
                    const grouped: Record<string, CropProgress[]> = {};

                    for (const p of progresses) {
                        if (!grouped[p.cropSeasonDetailId]) {
                            grouped[p.cropSeasonDetailId] = [];
                        }
                        grouped[p.cropSeasonDetailId].push(p);
                    }

                    const TOTAL_STAGES = 5;
                    const percentList: number[] = [];

                    for (const regionId in grouped) {
                        const steps = grouped[regionId];
                        const current = Math.max(...steps.map(s => s.stepIndex ?? 0));
                        const percent = Math.min(((current + 1) / TOTAL_STAGES) * 100, 100);
                        percentList.push(percent);
                    }

                    const average = percentList.length > 0
                        ? Math.round(percentList.reduce((a, b) => a + b, 0) / percentList.length)
                        : 0;

                    setOverallProgressData({
                        labels: ["Hoàn thành", "Còn lại"],
                        datasets: [
                            {
                                data: [average, 100 - average],
                                backgroundColor: ["#16a34a", "#f3f4f6"],
                                borderWidth: 1,
                            },
                        ],
                    });
                } catch (progressError) {
                    console.log("Không có dữ liệu tiến trình, sử dụng giá trị mặc định:", progressError);
                    setOverallProgressData(DEFAULT_PROGRESS_DATA);
                }

            } catch (error) {
                console.error("Lỗi lấy dữ liệu dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiCoffee className="w-6 h-6 text-orange-600 animate-pulse" />
                    </div>
                    <p className="text-gray-600 font-medium text-sm">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50">
            <div className="max-w-6xl mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">
                                Dashboard Nông dân
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Chào mừng bạn trở lại! Theo dõi hoạt động canh tác của bạn
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                            <FiCoffee className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                {stats && (
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={<FiClipboard className="w-5 h-5" />}
                                label="Mùa vụ đang hoạt động"
                                value={stats.activeSeasons}
                                color="orange"
                            />
                            <StatCard
                                icon={<FiBookOpen className="w-5 h-5" />}
                                label="Vùng sắp thu hoạch"
                                value={stats.upcomingHarvests}
                                color="green"
                            />
                            <StatCard
                                icon={<FiPackage className="w-5 h-5" />}
                                label="Yêu cầu nhập kho"
                                value={stats.pendingWarehouseRequests}
                                color="blue"
                            />
                            <StatCard
                                icon={<FiFeather className="w-5 h-5" />}
                                label="Phản hồi kỹ thuật chưa đọc"
                                value={stats.unreadAdvice}
                                color="purple"
                            />
                        </div>
                    </section>
                )}

                <section>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-4">
                            <DashboardSectionTitle title="Sản lượng theo tháng" />
                            {chartData ? (
                                <div className="h-[250px]">
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <FiTrendingUp className="w-10 h-10 text-orange-300 mx-auto mb-2" />
                                        <p className="text-sm">Đang tải dữ liệu biểu đồ...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-4">
                            <DashboardSectionTitle title="Tiến độ mùa vụ tổng thể" />
                            <div className="flex items-center justify-center">
                                <div className="relative h-[200px] w-[200px]">
                                    <Doughnut data={overallProgressData} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <span className="text-2xl font-bold text-green-700">
                                                {overallProgressData.datasets[0].data[0]}%
                                            </span>
                                            <p className="text-xs text-gray-500">Hoàn thành</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {alerts.length > 0 && (
                    <section>
                        <DashboardSectionTitle title="Cảnh báo" />
                        <div className="space-y-3">
                            {alerts.map((msg, idx) => (
                                <AlertCard key={idx} message={msg} />
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <DashboardSectionTitle title="Hành động nhanh" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ActionCard
                            icon={<FiClipboard className="w-5 h-5" />}
                            title="Quản lý mùa vụ"
                            description="Theo dõi và cập nhật thông tin mùa vụ canh tác."
                            href="/dashboard/farmer/crop-seasons"
                            color="orange"
                        />
                        <ActionCard
                            icon={<FiPackage className="w-5 h-5" />}
                            title="Gửi yêu cầu nhập kho"
                            description="Danh sách yêu cầu nhập kho."
                            href="/dashboard/farmer/warehouse-request"
                            color="blue"
                        />
                        <ActionCard
                            icon={<FiFeather className="w-5 h-5" />}
                            title="Phản hồi kỹ thuật"
                            description="Xem và trả lời phản hồi từ chuyên gia."
                            href="/dashboard/farmer/request-feedback"
                            color="green"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}) {
    const colorClasses = {
        orange: "bg-gradient-to-r from-orange-500 to-amber-500",
        green: "bg-gradient-to-r from-green-500 to-emerald-500",
        blue: "bg-gradient-to-r from-blue-500 to-cyan-500",
        purple: "bg-gradient-to-r from-purple-500 to-pink-500"
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center text-white`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xl font-bold text-gray-800">{value}</p>
                    <p className="text-gray-600 text-xs">{label}</p>
                </div>
            </div>
        </div>
    );
}

function AlertCard({ message }: { message: string }) {
    return (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="w-3 h-3 text-red-600" />
            </div>
            <div className="text-red-800 font-medium text-sm">{message}</div>
        </div>
    );
}

function ActionCard({
    icon,
    title,
    description,
    href,
    color
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    color: string;
}) {
    const colorClasses = {
        orange: "hover:border-orange-300 hover:bg-orange-50",
        green: "hover:border-green-300 hover:bg-green-50",
        blue: "hover:border-blue-300 hover:bg-blue-50"
    };

    return (
        <Link
            href={href}
            className={`p-4 bg-white rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition-all duration-200 block ${colorClasses[color as keyof typeof colorClasses]}`}
        >
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 bg-gradient-to-r from-${color}-500 to-${color === 'orange' ? 'amber' : color === 'green' ? 'emerald' : 'cyan'}-500 rounded-md flex items-center justify-center text-white`}>
                    {icon}
                </div>
                <h2 className="text-base font-semibold text-gray-800">{title}</h2>
            </div>
            <p className="text-gray-600 text-xs">{description}</p>
        </Link>
    );
}

function DashboardSectionTitle({ title }: { title: string }) {
    return (
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
            {title}
        </h2>
    );
}
