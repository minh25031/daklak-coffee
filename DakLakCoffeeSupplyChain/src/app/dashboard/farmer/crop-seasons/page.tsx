"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CropSeason, getAllCropSeasons } from "@/lib/api/cropSeasons";
import { Button } from "@/components/ui/button";

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
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Danh sách mùa vụ</h2>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ Tạo mùa vụ mới</Button>
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
                                        <Button variant="link" className="text-blue-600 text-sm">Xem</Button>
                                        <Button variant="link" className="text-orange-600 text-sm">Sửa</Button>

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
