'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getWarehouseReceiptById,
  confirmWarehouseReceipt
} from "@/lib/api/warehouseReceipt";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmedQuantity, setConfirmedQuantity] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ✅ Hàm xác định đã xác nhận dựa trên nội dung ghi chú
  const isConfirmed = receipt?.note?.includes('[Confirmed at');

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      const res = await getWarehouseReceiptById(id as string);
      if (res.status === 1) {
        setReceipt(res.data);
        setConfirmedQuantity(res.data.receivedQuantity); // default
      } else {
        alert("❌ " + res.message);
      }
    } catch (error) {
      alert("❌ Lỗi khi tải chi tiết phiếu");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!confirmedQuantity || confirmedQuantity <= 0) {
      setError("⚠️ Số lượng xác nhận phải lớn hơn 0.");
      return;
    }

    try {
      await confirmWarehouseReceipt(id as string, {
        confirmedQuantity,
        note
      });
      alert("✅ Xác nhận phiếu thành công");

      // 🔁 Refetch lại để cập nhật ngay UI
      await fetchReceipt();
    } catch (err: any) {
      setError("❌ " + err.message);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!receipt) return <p className="p-4">Không tìm thấy phiếu nhập kho.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Chi tiết phiếu nhập kho</CardTitle>
          <Link href="/dashboard/staff/receipts">
            <Button variant="outline">← Quay lại</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p><strong>Mã phiếu:</strong> {receipt.receiptCode}</p>
            <p><strong>Kho:</strong> {receipt.warehouseName}</p>
            <p><strong>Mẻ sơ chế:</strong> {receipt.batchCode}</p>
            <p><strong>Số lượng nhận:</strong> {receipt.receivedQuantity}kg</p>
            <p><strong>Ngày nhận:</strong> {new Date(receipt.receivedAt).toLocaleString()}</p>
            <p><strong>Ghi chú:</strong> {receipt.note || "Không có"}</p>
            <p><strong>Nhân viên:</strong> {receipt.staffName || "Không rõ"}</p>
          </div>
          <Badge
            className={`capitalize px-3 py-1 rounded-md font-medium text-sm ${
              isConfirmed
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isConfirmed ? "Đã xác nhận" : "Chưa xác nhận"}
          </Badge>
        </CardContent>
      </Card>

      {/* Xác nhận nếu chưa xác nhận */}
      {!isConfirmed && (
        <Card className="max-w-3xl mx-auto mt-6">
          <CardHeader>
            <CardTitle>Xác nhận phiếu nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số lượng xác nhận (kg)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={confirmedQuantity}
                  onChange={(e) => setConfirmedQuantity(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú (nếu có)
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="flex justify-end">
                <Button type="submit" className="bg-green-600 text-white">
                  Xác nhận
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
