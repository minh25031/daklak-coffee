"use client";

import { useEffect, useState } from "react";
import { getAllWarehouses } from "@/lib/api/warehouses";
import { getInventoriesByWarehouseId } from "@/lib/api/inventory";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type Warehouse = {
  warehouseId: string;
  name: string;
  location: string;
  capacity?: number;
};

export default function WarehouseListPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [usedCapacities, setUsedCapacities] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAllWarehouses();
        if (res?.status === 1 && Array.isArray(res.data)) {
          setWarehouses(res.data);

          const usageMap: Record<string, number> = {};
          for (const warehouse of res.data) {
            try {
              const inventories = await getInventoriesByWarehouseId(
                warehouse.warehouseId
              );
              const totalUsed = inventories.reduce(
                (sum: number, i: any) => sum + i.quantity,
                0
              );
              usageMap[warehouse.warehouseId] = totalUsed;
            } catch {
              usageMap[warehouse.warehouseId] = 0;
            }
          }
          setUsedCapacities(usageMap);
        } else {
          toast.error("❌ Không thể tải danh sách kho.");
        }
      } catch (error) {
        toast.error("❌ Đã xảy ra lỗi khi tải danh sách kho.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = warehouses.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-orange-600">Danh sách kho</h1>
        <div className="relative w-72">
          <Input
            placeholder="Tìm kiếm theo tên kho..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 border-orange-300 focus:ring-orange-400"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 italic">Không tìm thấy kho phù hợp.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((warehouse) => {
            const used = usedCapacities[warehouse.warehouseId] || 0;
            const total = warehouse.capacity || 0;
            const available = Math.max(0, total - used);
            const usedPercent = total > 0 ? (used / total) * 100 : 0;

            return (
              <Card
                key={warehouse.warehouseId}
                className="p-4 rounded-xl border shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24">
                    <Doughnut
                      data={{
                        labels: ["Đã sử dụng", "Còn trống"],
                        datasets: [
                          {
                            data: [used, available],
                            backgroundColor: ["#FB923C", "#86EFAC"],
                            hoverOffset: 6,
                          },
                        ],
                      }}
                      options={{
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        cutout: "60%",
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {warehouse.name}
                    </h2>
                    <p className="text-sm text-gray-500">{warehouse.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Dung lượng:{" "}
                      <span className="font-medium">
                        {(used || 0).toLocaleString()} /{" "}
                        {total.toLocaleString()} kg
                      </span>
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        usedPercent > 80 ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {usedPercent.toFixed(1)}% đã sử dụng
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/staff/warehouses/${warehouse.warehouseId}`}
                >
                  <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg transition">
                    Xem chi tiết
                  </button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
