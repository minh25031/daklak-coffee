'use client';

import { useEffect, useState } from "react";
import { getInventoryById } from "@/lib/api/inventory";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InventoryDetailManagerPage() {
  const { id } = useParams();
  const [inventory, setInventory] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      async function fetchInventory() {
        try {
          const res = await getInventoryById(id as string);

          if (res?.data) {
            setInventory(res.data);
          } else if (res?.inventoryId) {
            setInventory(res);
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
          <CardTitle>Chi tiết tồn kho (Quản lý)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <p><strong>Mã tồn kho:</strong> {inventory.inventoryCode}</p>
            <p><strong>Tên kho:</strong> {inventory.warehouseName}</p>
            <p><strong>Mã lô:</strong> {inventory.batchCode}</p>
            <p><strong>Sản phẩm:</strong> {inventory.productName || "Không có"}</p>
            <p><strong>Loại cà phê:</strong> {inventory.coffeeTypeName || "Không xác định"}</p>
            <p><strong>Số lượng:</strong> {inventory.quantity} {inventory.unit}</p>
            <p><strong>Ngày tạo:</strong> {new Date(inventory.createdAt).toLocaleString()}</p>
            <p><strong>Ngày cập nhật:</strong> {new Date(inventory.updatedAt).toLocaleString()}</p>
          </div>

          <div className="mt-6">
            <Link href="/dashboard/manager/inventories">
              <Button variant="outline">← Quay lại danh sách</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
