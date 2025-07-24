"use client";

import { useEffect, useState } from "react";
import {
  getAllProcessingWastes,
  ProcessingWaste,
} from "@/lib/api/processingBatchWastes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProcessingBatchWastesPage() {
  const router = useRouter();
  const [data, setData] = useState<ProcessingWaste[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProcessingWastes().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const filtered = data.filter((item) =>
    item.wasteCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-amber-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Tìm mã lô..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <Button
          className="flex gap-2"
          onClick={() =>
            router.push("/dashboard/farmer/processing/wastes/create")
          }
        >
          <Plus className="w-4 h-4" />
          Thêm chất thải
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b"></div>

        {loading ? (
          <div className="py-6 text-center text-sm text-gray-500 italic">
            ⏳ Đang tải dữ liệu...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500 italic">
            🚫 Không tìm thấy chất thải nào
          </div>
        ) : (
          <table className="w-full text-sm table-auto">
            <thead className="bg-gray-50 text-gray-700 border-b text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Mã lô</th>
                <th className="px-6 py-3 font-medium">Loại chất thải</th>
                <th className="px-6 py-3 font-medium">Số lượng</th>
                <th className="px-6 py-3 font-medium">Đơn vị</th>
                <th className="px-6 py-3 font-medium">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.wasteId}
                  className="hover:bg-orange-50 border-b transition"
                >
                  <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>{item.wasteCode}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.wasteType}</td>
                  <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                  <td className="px-6 py-4 text-gray-600">{item.unit}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
