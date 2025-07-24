'use client';

import { useEffect, useState } from "react";
import { getInventoryById } from "@/lib/api/inventory";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InventoryDetailPage() {
  const { id } = useParams();
  const [inventory, setInventory] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      async function fetchInventory() {
        try {
          const res = await getInventoryById(id as string);

          // ✅ Hỗ trợ cả ServiceResult hoặc trả thẳng object
          if (res?.data) {
            setInventory(res.data);
          } else if (res?.inventoryId) {
            setInventory(res); // fallback nếu API trả object trực tiếp
          } else {
            setError(res.message || "Không tìm thấy tồn kho.");
          }
        } catch (err: any) {
          setError(err.message || "Lỗi khi tải dữ liệu tồn kho.");
        }
      }
      fetchInventory();
    }
  }, [id]);

  if (error) return <div className="text-red-500 p-6">{error}</div>;
  if (!inventory) return <div className="p-6">Đang tải dữ liệu tồn kho...</div>;

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết tồn kho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Mã:</strong> {inventory.inventoryCode}</p>
            <p><strong>Kho:</strong> {inventory.warehouseName}</p>
            <p><strong>Batch:</strong> {inventory.batchCode}</p>
            <p><strong>Sản phẩm:</strong> {inventory.productName || "Không có"}</p>
            <p><strong>Loại cà phê:</strong> {inventory.coffeeTypeName || "Không xác định"}</p>
            <p><strong>Số lượng:</strong> {inventory.quantity} {inventory.unit}</p>
            <p><strong>Tạo lúc:</strong> {new Date(inventory.createdAt).toLocaleString()}</p>
            <p><strong>Cập nhật:</strong> {new Date(inventory.updatedAt).toLocaleString()}</p>
          </div>

          <div className="mt-4">
            <Link href="/dashboard/staff/inventories">
              <Button variant="outline">← Quay lại danh sách</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
