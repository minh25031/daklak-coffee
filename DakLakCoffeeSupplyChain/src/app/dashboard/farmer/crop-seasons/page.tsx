"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CropSeason, getAllCropSeasons } from "@/lib/api/cropSeasons";

export default function CropSeasonListPage() {
    const [data, setData] = useState<CropSeason[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const result = await getAllCropSeasons();
            setData(result);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Danh sách mùa vụ</h1>
                <Link
                    href="/dashboard/farmer/crop-seasons/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Tạo mùa vụ mới
                </Link>
            </div>

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : data.length === 0 ? (
                <p>Không có mùa vụ nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border text-left">Tên mùa vụ</th>
                                <th className="px-4 py-2 border text-left">Nông hộ</th>
                                <th className="px-4 py-2 border text-left">Thời gian</th>
                                <th className="px-4 py-2 border text-left">Trạng thái</th>
                                <th className="px-4 py-2 border text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.cropSeasonId}>
                                    <td className="px-4 py-2 border">{item.seasonName}</td>
                                    <td className="px-4 py-2 border">{item.farmerName}</td>
                                    <td className="px-4 py-2 border">
                                        {item.startDate} → {item.endDate}
                                    </td>
                                    <td className="px-4 py-2 border">{item.status}</td>
                                    <td className="px-4 py-2 border space-x-2">
                                        <Link href={`/dashboard/farmer/crop-seasons/${item.cropSeasonId}`}>
                                            Xem
                                        </Link>
                                        <Link
                                            href={`/dashboard/farmer/crop-seasons/${item.cropSeasonId}/edit`}
                                            className="text-yellow-600 underline"
                                        >
                                            Sửa
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
