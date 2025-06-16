"use client";

export default function ExpertDashboard() {
    return (
        <main className="p-6 bg-orange-50 min-h-screen">
            <h1 className="text-2xl font-bold text-orange-600 mb-6">
                🧑‍🔬 Expert Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard
                    title="🧠 Tư vấn kỹ thuật"
                    description="Hỗ trợ kỹ thuật cho nông dân, phản hồi các yêu cầu theo mùa vụ."
                />
                <DashboardCard
                    title="📄 Viết bài chuyên môn"
                    description="Chia sẻ kiến thức, kỹ thuật canh tác qua các bài viết chuyên sâu."
                />
                <DashboardCard
                    title="🆘 Phản hồi sự cố"
                    description="Xử lý các báo cáo bất thường về mùa vụ hoặc sơ chế từ nông dân."
                />
                <DashboardCard
                    title="📊 Đánh giá tiến độ"
                    description="Đánh giá quá trình canh tác và sơ chế theo từng mùa."
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
