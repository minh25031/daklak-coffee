'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLogsByInventoryId } from "@/lib/api/inventoryLogs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InventoryLogsPage() {
  const { id } = useParams();
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const result = await getLogsByInventoryId(id as string);

        // ✅ Không kiểm tra status nữa, vì trả về trực tiếp là mảng
        if (Array.isArray(result) && result.length > 0) {
          setLogs(result);
        } else {
          setError("Không có log tồn kho.");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải log tồn kho.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchLogs();
  }, [id]);

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thay đổi tồn kho</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>⏳ Đang tải dữ liệu...</p>}

          {!loading && error && (
            <p className="text-red-500">{error}</p>
          )}

          {!loading && !error && logs.length > 0 && (
            <ul className="space-y-3">
              {logs.map((log) => (
                <li
                  key={log.logId}
                  className="border p-4 rounded-md bg-white shadow-sm space-y-1"
                >
                  <p><strong>🔄 Hành động:</strong> {log.actionType}</p>
                  <p><strong>📦 Số lượng thay đổi:</strong> {log.quantityChanged} kg</p>
                  <p><strong>📝 Ghi chú:</strong> {log.note || "Không có"}</p>
                  <p><strong>👤 Người cập nhật:</strong> {log.updatedByName || "Hệ thống"}</p>
                  <p><strong>🕒 Thời gian:</strong> {new Date(log.loggedAt).toLocaleString("vi-VN")}</p>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && logs.length === 0 && (
            <p>Không có lịch sử tồn kho.</p>
          )}

          <div className="mt-6">
            <Link href={`/dashboard/manager/inventories/${id}`}>
              <Button variant="outline">← Quay lại chi tiết tồn kho</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
