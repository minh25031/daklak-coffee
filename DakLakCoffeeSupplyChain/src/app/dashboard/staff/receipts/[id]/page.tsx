'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getWarehouseReceiptById,
  confirmWarehouseReceipt,
} from "@/lib/api/warehouseReceipt";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Package, Boxes, CalendarClock, ClipboardCheck, User, FileText, CheckCircle, Clock, Leaf, Coffee
} from "lucide-react";

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [confirmedQuantity, setConfirmedQuantity] = useState<number>(0);
  const [note, setNote] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const isConfirmed = Boolean(receipt?.receivedAt);

  // Helper function to determine coffee type
  const getCoffeeType = (receipt: any) => {
    // Cà phê đã sơ chế: có batchId, không có detailId
    if (receipt?.batchId && !receipt?.detailId) return 'processed';
    // Cà phê tươi: không có batchId, có detailId
    if (!receipt?.batchId && receipt?.detailId) return 'fresh';
    return 'unknown';
  };

  const getCoffeeTypeLabel = (receipt: any) => {
    const type = getCoffeeType(receipt);
    switch (type) {
      case 'fresh': return 'Cà phê tươi';
      case 'processed': return 'Cà phê đã sơ chế';
      default: return 'Không xác định';
    }
  };

  const getCoffeeTypeIcon = (receipt: any) => {
    const type = getCoffeeType(receipt);
    switch (type) {
      case 'fresh': return <Leaf className="w-5 h-5 text-orange-600" />;
      case 'processed': return <Coffee className="w-5 h-5 text-purple-600" />;
      default: return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCoffeeInfo = (receipt: any) => {
    const type = getCoffeeType(receipt);
    switch (type) {
      case 'fresh':
        return {
          label: 'Mùa vụ',
          value: receipt?.cropSeasonName || receipt?.detailCode || 'N/A',
          icon: <Leaf className="text-orange-600" />
        };
      case 'processed':
        return {
          label: 'Lô sơ chế',
          value: receipt?.batchCode || 'N/A',
          icon: <Coffee className="text-purple-600" />
        };
      default:
        return {
          label: 'Thông tin',
          value: 'N/A',
          icon: <Package className="text-gray-600" />
        };
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchReceipt() {
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await getWarehouseReceiptById(id as string);
    if (res.status === 1) {
      setReceipt(res.data);
      setConfirmedQuantity(res.data.receivedQuantity || 0);
      setNote(res.data.note || "");
    } else {
      setError(res.message || "Không thể tải chi tiết phiếu.");
    }
    setLoading(false);
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!confirmedQuantity || confirmedQuantity <= 0) {
      setError("⚠️ Số lượng xác nhận phải lớn hơn 0.");
      return;
    }
    if (confirmedQuantity < (receipt?.receivedQuantity ?? 0) && note.trim() === "") {
      setError("⚠️ Vui lòng ghi chú lý do nếu xác nhận ít hơn số lượng đã tạo.");
      return;
    }

    setSubmitting(true);
    const res = await confirmWarehouseReceipt(id as string, { confirmedQuantity, note });

    if (res.status === 1) {
      setSuccess("✅ Xác nhận phiếu nhập thành công");
      await fetchReceipt();
    } else {
      setError(res.message || "Xác nhận thất bại.");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-green-600 rounded-full" />
      </div>
    );
  }

  if (!receipt) {
    return <div className="p-6 text-red-600">❌ Không tìm thấy phiếu nhập kho.</div>;
  }

  const coffeeType = getCoffeeType(receipt);
  const coffeeTypeLabel = getCoffeeTypeLabel(receipt);
  const coffeeTypeIcon = getCoffeeTypeIcon(receipt);
  const coffeeInfo = getCoffeeInfo(receipt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent">
              📥 Chi tiết phiếu nhập kho
            </h1>
            <p className="text-gray-600">Mã phiếu: {receipt.receiptCode}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Coffee Type Badge */}
        <div className="bg-white shadow rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            {coffeeTypeIcon}
            <div>
              <h3 className="font-semibold text-gray-800">Loại cà phê</h3>
              <div className="flex items-center gap-2">
                <Badge className={`px-3 py-1 rounded-full font-medium ${
                  coffeeType === 'fresh' 
                    ? 'bg-orange-100 text-orange-800 border-orange-200' 
                    : coffeeType === 'processed'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {coffeeTypeLabel}
                </Badge>
                {coffeeType === 'fresh' && (
                  <span className="text-sm text-orange-600">🌱 Tươi</span>
                )}
                {coffeeType === 'processed' && (
                  <span className="text-sm text-purple-600">☕ Đã sơ chế</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <DetailItem icon={<Package className="text-green-600" />} label="Kho" value={receipt.warehouseName} />
            <DetailItem icon={coffeeInfo.icon} label={coffeeInfo.label} value={coffeeInfo.value} />
            <DetailItem icon={<ClipboardCheck className="text-blue-600" />} label="Số lượng nhận" value={`${receipt.receivedQuantity} kg`} />
            <DetailItem
              icon={<CalendarClock className="text-red-500" />}
              label="Ngày nhận"
              value={receipt.receivedAt ? new Date(receipt.receivedAt).toLocaleString("vi-VN") : "—"}
            />
            <DetailItem icon={<FileText className="text-purple-600" />} label="Ghi chú" value={receipt.note || "Không có"} />
            <DetailItem icon={<User className="text-gray-600" />} label="Nhân viên" value={receipt.staffName || "Không rõ"} />
            <DetailItem
              icon={isConfirmed ? <CheckCircle className="text-green-600" /> : <Clock className="text-yellow-600" />}
              label="Trạng thái"
              value={
                isConfirmed
                  ? <span className="text-green-600 font-semibold">✅ Đã xác nhận</span>
                  : <span className="text-yellow-600 font-semibold">⏳ Chưa xác nhận</span>
              }
            />
          </div>
        </div>

        {/* Additional Coffee Info */}
        {coffeeType === 'fresh' && receipt?.cropSeasonName && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Leaf className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800 mb-2">🌱 Thông tin cà phê tươi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-orange-700">Mùa vụ:</span>
                    <span className="ml-2 text-orange-800 font-semibold">{receipt.cropSeasonName}</span>
                  </div>
                  {receipt.coffeeType && (
                    <div>
                      <span className="font-medium text-orange-700">Loại cà phê:</span>
                      <span className="ml-2 text-orange-800 font-semibold">{receipt.coffeeType}</span>
                    </div>
                  )}
                  {receipt.detailCode && (
                    <div>
                      <span className="font-medium text-orange-700">Mã chi tiết:</span>
                      <span className="ml-2 text-orange-800 font-semibold">{receipt.detailCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {coffeeType === 'processed' && receipt?.batchCode && (
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Coffee className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">☕ Thông tin cà phê đã sơ chế</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-purple-700">Mã lô:</span>
                    <span className="ml-2 text-purple-800 font-semibold">{receipt.batchCode}</span>
                  </div>
                  {receipt.coffeeType && (
                    <div>
                      <span className="font-medium text-purple-700">Loại cà phê:</span>
                      <span className="ml-2 text-purple-800 font-semibold">{receipt.coffeeType}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded">{success}</div>}

        {/* Confirm Form */}
        {!isConfirmed && (
          <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">✅ Xác nhận phiếu nhập</h2>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Số lượng xác nhận (kg)</label>
                <Input
                  type="number"
                  min={1}
                  value={confirmedQuantity}
                  onChange={(e) => {
                    setConfirmedQuantity(Number(e.target.value));
                    setError("");
                    setSuccess("");
                  }}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ghi chú{" "}
                  {confirmedQuantity < (receipt?.receivedQuantity ?? 0) && (
                    <span className="text-red-500">(bắt buộc)</span>
                  )}
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder={
                    confirmedQuantity < (receipt?.receivedQuantity ?? 0)
                      ? "Vui lòng ghi lý do xác nhận thiếu..."
                      : "Ghi chú thêm (nếu có)"
                  }
                  disabled={submitting}
                />
              </div>

              <Button type="submit" className="bg-green-600 text-white" disabled={submitting}>
                {submitting ? "Đang xác nhận..." : "Xác nhận"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
      <div className="p-2 bg-gray-100 rounded-md">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );
}
