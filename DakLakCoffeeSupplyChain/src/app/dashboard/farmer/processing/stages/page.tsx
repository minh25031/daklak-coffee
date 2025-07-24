"use client";

import { useEffect, useState } from "react";
import {
  getAllProcessingStagess,
  ProcessingStages,
} from "@/lib/api/processingStages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProcessingStagesPage() {
  const router = useRouter();
  const [data, setData] = useState<ProcessingStages[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getAllProcessingStagess();
      setData(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((stage) =>
    stage.stageName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-amber-50 p-6 gap-6">
      {/* Sidebar filter */}
      <aside className="w-64">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Tìm kiếm</h2>
          <div className="relative">
            <Input
              placeholder="Tìm tên công đoạn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h1 className="text-lg font-semibold text-gray-800">
              Danh sách công đoạn sơ chế
            </h1>
            <Button
              onClick={() =>
                router.push("/dashboard/farmer/processing/stages/create")
              }
              className="flex gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm công đoạn
            </Button>
          </div>

          {loading ? (
            <div className="py-6 text-center text-sm text-gray-500 italic">
              ⏳ Đang tải dữ liệu...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500 italic">
              🚫 Không tìm thấy công đoạn nào
            </div>
          ) : (
            <table className="w-full text-sm table-auto">
              <thead className="bg-gray-100 text-gray-700 font-medium">
                <tr>
                  <th className="px-6 py-3 text-left">Tên công đoạn</th>
                  <th className="px-6 py-3 text-left">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((stage) => (
                  <tr
                    key={stage.stageId}
                    className="border-t transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {stage.stageName}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {stage.description || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
