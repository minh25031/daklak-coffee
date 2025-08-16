'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getInboundRequestById,
  approveInboundRequest,
  rejectInboundRequest,
} from "@/lib/api/warehouseInboundRequest";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  CalendarClock,
  ClipboardCheck,
  User,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Coffee,
  Layers,
  Leaf
} from "lucide-react";

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
    switch (status) {
      case "Pending":
        return <Badge className="bg-gray-200 text-gray-800">⏳ Đang chờ duyệt</Badge>;
      case "Approved":
        return <Badge className="bg-blue-100 text-blue-800">📝 Đã duyệt</Badge>;
      case "Completed":
        return <Badge className="bg-green-100 text-green-800">✅ Hoàn tất</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">❌ Đã từ chối</Badge>;
      case "Cancelled":
        return <Badge className="bg-yellow-100 text-yellow-800">🚫 Đã huỷ</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">{status}</Badge>;
    }
  };

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-green-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent">
              📥 Chi tiết yêu cầu nhập kho
            </h1>
            <p className="text-gray-600">Mã yêu cầu: {request.requestCode}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Detail section */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <DetailItem icon={<ClipboardCheck className="text-green-600" />} label="Trạng thái" value={getStatusBadge(request.status)} />
            <DetailItem icon={<CalendarClock className="text-rose-600" />} label="Ngày tạo" value={formatDate(request.createdAt)} />
            <DetailItem icon={<CalendarClock className="text-blue-600" />} label="Ngày giao dự kiến" value={formatDate(request.preferredDeliveryDate)} />
            {request.actualDeliveryDate && (
              <DetailItem icon={<CalendarClock className="text-purple-600" />} label="Ngày giao thực tế" value={formatDate(request.actualDeliveryDate)} />
            )}
            <DetailItem icon={<Package className="text-orange-600" />} label="Số lượng" value={`${request.requestedQuantity} kg`} />
            <DetailItem icon={<FileText className="text-gray-600" />} label="Ghi chú" value={request.note || "Không có"} />
            <DetailItem icon={<User className="text-indigo-600" />} label="Nông dân" value={request.farmerName} />
            <DetailItem icon={<Phone className="text-gray-500" />} label="SĐT" value={request.farmerPhone} />
            {request.businessStaffName && (
              <DetailItem icon={<User className="text-green-500" />} label="Nhân viên phụ trách" value={request.businessStaffName} />
            )}
            {(request.batchCode || request.detailCode) && (
              <DetailItem 
                icon={<Layers className="text-orange-500" />} 
                label={request.batchCode ? "Mã lô hàng" : "Mã chi tiết"} 
                value={request.batchCode || request.detailCode || "N/A"} 
              />
            )}
            {(request.coffeeType || request.coffeeTypeDetail) && (
              <DetailItem 
                icon={<Coffee className="text-brown-600" />} 
                label="Loại cà phê" 
                value={request.coffeeType || request.coffeeTypeDetail || "N/A"} 
              />
            )}
            {(request.seasonCode || request.cropSeasonName) && (
              <DetailItem 
                icon={<Leaf className="text-lime-500" />} 
                label="Mùa vụ" 
                value={request.cropSeasonName || request.seasonCode || "N/A"} 
              />
            )}
          </div>

          {/* Action buttons */}
          {request.status === "Pending" && (
            <div className="pt-6 flex flex-wrap gap-4">
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
        </div>
      </div>
    </div>
  );
}

// Reusable detail component
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
    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
      <div className="p-2 bg-gray-100 rounded-md">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );
}
