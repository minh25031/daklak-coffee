"use client";

import { useEffect, useState } from "react";
import {
  getAllProcessingMethods,
  ProcessingMethod,
} from "@/lib/api/processingMethods";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Coffee } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ProcessingMethodsPage() {
  const router = useRouter();
  const [data, setData] = useState<ProcessingMethod[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const result = await getAllProcessingMethods();
    console.log("Fetched data:", result);
    setData(result);
    setLoading(false);
  };
  fetchData();
}, []);

  const filtered = data.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-amber-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Tìm kiếm phương pháp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <Button
          className="flex gap-2"
          onClick={() =>
            router.push("/dashboard/farmer/processing/methods/create")
          }
        >
          <Plus className="w-4 h-4" />
          Thêm phương pháp
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
            🚫 Không tìm thấy phương pháp nào
          </div>
        ) : (
          <table className="w-full text-sm table-auto">
            <thead className="bg-gray-50 text-gray-700 border-b text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Tên phương pháp</th>
                <th className="px-6 py-3 font-medium">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((method) => (
                <tr
                  key={method.methodId}
                  className="hover:bg-orange-50 border-b transition"
                >
                  <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-orange-400" />
                    <span>{method.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {method.description || (
                      <span className="italic text-gray-400">
                        Không có mô tả
                      </span>
                    )}
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
