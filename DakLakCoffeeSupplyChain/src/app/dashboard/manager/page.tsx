"use client";

export default function ManagerDashboard() {
    return (
        <main className="p-6 bg-orange-50 min-h-screen">
            <h1 className="text-2xl font-bold text-orange-600 mb-6">
                🧑‍💼 Manager Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard
                    title="📄 Hợp đồng thu mua"
                    description="Theo dõi và quản lý các hợp đồng với nông hộ và doanh nghiệp."
                />
                <DashboardCard
                    title="👨‍🌾 Danh sách nông dân"
                    description="Xem và tương tác với các nông hộ đang hợp tác."
                />
                <DashboardCard
                    title="📦 Mẻ sơ chế"
                    description="Quản lý và theo dõi các mẻ sơ chế theo mùa vụ."
                />
                <DashboardCard
                    title="📊 Báo cáo sản lượng"
                    description="Thống kê về sản lượng, chất lượng và tiến độ."
                />
            </div>
        </main>
    );
}

function DashboardCard({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-lg font-semibold mb-1">{title}</h2>
            <p className="text-gray-500 text-sm">{description}</p>
        </div>
    );
}
