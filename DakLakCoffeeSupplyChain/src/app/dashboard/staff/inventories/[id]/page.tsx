'use client';

import { useEffect, useState } from "react";
import { getInventoryById } from "@/lib/api/inventory";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Warehouse,
  Package,
  Coffee,
  Boxes,
  CalendarDays,
  RefreshCw,
  Tag
} from "lucide-react";

export default function InventoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [inventory, setInventory] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      async function fetchInventory() {
        try {
          const res = await getInventoryById(id as string);

          if (res?.data) setInventory(res.data);
          else if (res?.inventoryId) setInventory(res);
          else setError(res.message || "Không tìm thấy tồn kho.");
        } catch (err: any) {
          setError(err.message || "Lỗi khi tải dữ liệu tồn kho.");
        }
      }
      fetchInventory();
    }
  }, [id]);

  if (error) return <div className="text-red-500 p-6">{error}</div>;
  if (!inventory) return <div className="p-6">⏳ Đang tải dữ liệu tồn kho...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              📦 Chi tiết tồn kho
            </h1>
            <p className="text-gray-600">Xem thông tin chi tiết của lô hàng tồn</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Detail grid */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <DetailItem
              icon={<Tag className="text-emerald-600" />}
              label="Mã tồn kho"
              value={inventory.inventoryCode}
            />
            <DetailItem
              icon={<Warehouse className="text-orange-600" />}
              label="Kho"
              value={inventory.warehouseName}
            />
            <DetailItem
              icon={<Package className="text-blue-600" />}
              label="Lô sản xuất"
              value={inventory.batchCode}
            />
            <DetailItem
              icon={<Boxes className="text-purple-600" />}
              label="Sản phẩm"
              value={inventory.productName || "Không có"}
            />
            <DetailItem
              icon={<Coffee className="text-amber-600" />}
              label="Loại cà phê"
              value={inventory.coffeeTypeName || "Không xác định"}
            />
            <DetailItem
              icon={<Boxes className="text-green-600" />}
              label="Số lượng"
              value={`${inventory.quantity} ${inventory.unit}`}
            />
            <DetailItem
              icon={<CalendarDays className="text-rose-600" />}
              label="Ngày tạo"
              value={new Date(inventory.createdAt).toLocaleString("vi-VN")}
            />
            <DetailItem
              icon={<RefreshCw className="text-gray-600" />}
              label="Ngày cập nhật"
              value={new Date(inventory.updatedAt).toLocaleString("vi-VN")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component hiển thị 1 trường thông tin
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="p-2 bg-white rounded-lg shadow">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
