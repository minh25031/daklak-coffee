'use client';

import { useEffect, useState } from "react";
import { getInventoryById } from "@/lib/api/inventory";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Warehouse,
  Package,
  Coffee,
  Boxes,
  CalendarDays,
  RefreshCw,
  Tag,
  Eye,
  History
} from "lucide-react";
import Link from "next/link";

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

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <p className="text-red-600 font-medium text-lg">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/staff/inventories')}
          className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    </div>
  );

  if (!inventory) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">⏳ Đang tải dữ liệu tồn kho...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  📦 Chi tiết tồn kho
                </h1>
                <p className="text-gray-600 text-sm">
                  Xem thông tin chi tiết của lô hàng tồn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/staff/inventories/${id}/logs`}>
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <History className="w-4 h-4 mr-2" />
                  Lịch sử
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/staff/inventories')}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách
              </Button>
            </div>
          </div>
        </div>

        {/* Detail grid */}
        <Card className="border-blue-100 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem
                icon={<Tag className="text-blue-600" />}
                label="Mã tồn kho"
                value={inventory.inventoryCode}
              />
              <DetailItem
                icon={<Warehouse className="text-orange-600" />}
                label="Kho"
                value={inventory.warehouseName}
              />
              <DetailItem
                icon={<Package className="text-purple-600" />}
                label="Lô sản xuất"
                value={inventory.batchCode}
              />
              <DetailItem
                icon={<Boxes className="text-indigo-600" />}
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
          </CardContent>
        </Card>
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
    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-gray-900 text-sm">{value}</p>
      </div>
    </div>
  );
}
