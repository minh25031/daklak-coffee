'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInventoryLogById } from "@/lib/api/inventoryLogs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InventoryLogDetailPage() {
  const params = useParams();
  const logId = params?.id as string;
  const router = useRouter();

  const [log, setLog] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getInventoryLogById(logId); // gọi API trực tiếp theo logId
        setLog(data);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải dữ liệu log.");
      }
    }

    if (logId) fetchData();
  }, [logId]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!log) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="p-6">
      <Button onClick={() => router.back()} className="mb-4">← Quay lại</Button>
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết log tồn kho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>📦 Mã lô hàng:</strong> {log.batchCode}</p>
          <p><strong>📋 Sản phẩm:</strong> {log.productName}</p>
          <p><strong>☕ Loại cà phê:</strong> {log.coffeeTypeName}</p>
          <p><strong>🌱 Vụ mùa:</strong> {log.seasonCode}</p>
          <p><strong>👨‍🌾 Nông dân:</strong> {log.farmerName}</p>
          <hr />
          <p><strong>🏠 Kho:</strong> {log.warehouseName}</p>
          <p><strong>🔄 Hành động:</strong> {log.actionType}</p>
          <p><strong>🧮 Số lượng:</strong> {log.quantityChanged} kg</p>
          <p><strong>📝 Ghi chú:</strong> {log.note || "Không có"}</p>
          <p><strong>👤 Người cập nhật:</strong> {log.updatedByName || "Hệ thống"}</p>
          <p><strong>🕒 Thời gian:</strong> {new Date(log.loggedAt).toLocaleString("vi-VN")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
