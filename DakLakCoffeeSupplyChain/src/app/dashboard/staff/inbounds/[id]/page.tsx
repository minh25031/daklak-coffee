'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getInboundRequestById,
  approveInboundRequest,
  rejectInboundRequest,
} from "@/lib/api/warehouseInboundRequest";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InboundRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      const res = await getInboundRequestById(id as string);
      if (res.status === 1) {
        setRequest(res.data);
      } else {
        alert("Lỗi: " + res.message);
        router.push("/dashboard/staff/inbounds");
      }
    }

    fetchDetail();
  }, [id, router]);

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveInboundRequest(id as string);
    alert(res.message);
    router.push("/dashboard/staff/inbounds");
  };

  const handleReject = async () => {
    setLoading(true);
    const res = await rejectInboundRequest(id as string);
    alert(res.message);
    router.push("/dashboard/staff/inbounds");
  };

  const formatDate = (value: string | Date) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? "Không xác định" : d.toLocaleString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
  const base = "capitalize px-3 py-1 rounded-md font-medium text-sm";

  switch (status) {
    case "Pending":
      return <Badge className={`${base} bg-gray-100 text-gray-800`}>⏳ Đang chờ duyệt</Badge>;
    case "Approved":
      return <Badge className={`${base} bg-blue-100 text-blue-800`}>📝 Đã duyệt</Badge>;
    case "Completed":
      return <Badge className={`${base} bg-green-100 text-green-800`}>✅ Hoàn tất</Badge>;
    case "Rejected":
      return <Badge className={`${base} bg-red-100 text-red-800`}>❌ Đã từ chối</Badge>;
    case "Cancelled":
      return <Badge className={`${base} bg-yellow-100 text-yellow-800`}>🚫 Đã huỷ</Badge>;
    default:
      return <Badge className={`${base} bg-muted text-muted-foreground`}>{status}</Badge>;
  }
};

  if (!request) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">📥 Chi tiết yêu cầu nhập kho</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
          <div><strong>Mã yêu cầu:</strong> {request.requestCode}</div>
          <div><strong>Trạng thái:</strong> {getStatusBadge(request.status)}</div>

          <div><strong>Ngày tạo:</strong> {formatDate(request.createdAt)}</div>
          <div><strong>Ngày giao dự kiến:</strong> {formatDate(request.preferredDeliveryDate)}</div>

          {request.actualDeliveryDate && (
            <div><strong>Ngày giao thực tế:</strong> {formatDate(request.actualDeliveryDate)}</div>
          )}

          <div><strong>Số lượng:</strong> {request.requestedQuantity} kg</div>
          <div><strong>Ghi chú:</strong> {request.note || "Không có"}</div>

          <div><strong>Nông dân:</strong> {request.farmerName}</div>
          <div><strong>Điện thoại:</strong> {request.farmerPhone}</div>

          {request.businessStaffName && (
            <div><strong>Nhân viên phụ trách:</strong> {request.businessStaffName}</div>
          )}

          {request.batchCode && (
            <div><strong>Mã lô hàng:</strong> {request.batchCode}</div>
          )}
          {request.coffeeType && (
            <div><strong>Loại cà phê:</strong> {request.coffeeType}</div>
          )}
          {request.seasonCode && (
            <div><strong>Mùa vụ:</strong> {request.seasonCode}</div>
          )}

          {request.status === "Pending" && (
            <div className="md:col-span-2 pt-4 flex gap-4">
              <Button
                onClick={handleApprove}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                ✅ Duyệt yêu cầu
              </Button>
              <Button
                onClick={handleReject}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                ❌ Từ chối yêu cầu
              </Button>
            </div>
          )}
          <div className="md:col-span-2 pt-4">
  <Button
    variant="outline"
    onClick={() => router.push("/dashboard/staff/inbounds")}
  >
    ← Quay lại danh sách
  </Button>
</div>
        </CardContent>
      </Card>
    </div>
  );
}
