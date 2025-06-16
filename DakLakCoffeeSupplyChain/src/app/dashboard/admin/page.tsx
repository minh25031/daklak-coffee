"use client";

export default function ManagerDashboard() {
    return (
        <main className="p-6 bg-orange-50 min-h-screen">
            <h1 className="text-2xl font-bold text-orange-600 mb-6">
                🧑‍💼 Manager Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard
                    title="📄 Hợp đồng"
                    description="Quản lý các hợp đồng thu mua, giao hàng, thanh toán."
                />
                <DashboardCard
                    title="👨‍🌾 Danh sách nông dân"
                    description="Theo dõi và quản lý các hộ nông dân hợp tác."
                />
                <DashboardCard
                    title="📊 Báo cáo"
                    description="Xem thống kê về sản lượng, tiến độ, và chất lượng."
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
