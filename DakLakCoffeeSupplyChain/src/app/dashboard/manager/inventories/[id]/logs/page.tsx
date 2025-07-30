"use client";

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
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">📑 Lịch sử thay đổi tồn kho</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-gray-600 italic">⏳ Đang tải dữ liệu...</p>
          )}

          {!loading && error && (
            <p className="text-red-500">{error}</p>
          )}

          {!loading && !error && logs.length > 0 && (
            <ul className="space-y-4 mt-4">
              {logs.map((log, index) => (
                <li
                  key={log.logId}
                  className="border-l-4 border-blue-600 bg-gray-50 p-4 rounded-md shadow-sm relative"
                >
                  <div className="absolute -left-2 top-4 w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div className="space-y-1 ml-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">🔄 Hành động:</span> {log.actionType}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">📦 Số lượng:</span> {log.quantityChanged} kg
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">📝 Ghi chú:</span> {log.note || "Không có"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">👤 Người cập nhật:</span> {log.updatedByName || "Hệ thống"}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">🕒 Thời gian:</span>{" "}
                      {new Date(log.loggedAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && logs.length === 0 && (
            <p className="text-gray-600 italic">Không có lịch sử tồn kho.</p>
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
